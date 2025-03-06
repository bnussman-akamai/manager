"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var lke_1 = require("support/constants/lke");
var lke_2 = require("support/intercepts/lke");
var random_1 = require("support/util/random");
var downloads_1 = require("support/util/downloads");
var ui_1 = require("support/ui");
var feature_flags_1 = require("support/intercepts/feature-flags");
var mockKubeconfigContents = '---'; // Valid YAML.
var mockKubeconfigResponse = {
    kubeconfig: btoa(mockKubeconfigContents),
};
var mockCluster = factories_1.kubernetesClusterFactory.build();
var url = "/kubernetes/clusters/".concat(mockCluster.id);
var mockNodePools = factories_1.nodePoolFactory.buildList(2);
var buildTags = function (num) {
    var tags = [];
    for (var i = 0; i < num; i++) {
        tags.push((0, random_1.randomLabel)(3));
    }
    return tags;
};
describe('LKE summary page', function () {
    beforeEach(function () {
        // Mock the APL feature flag to be disabled.
        (0, feature_flags_1.mockAppendFeatureFlags)({
            apl: false,
        });
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_2.mockGetKubeconfig)(mockCluster.id, mockKubeconfigResponse).as('getKubeconfig');
    });
    it('can download kubeconfig', function () {
        var mockKubeconfigFilename = "".concat(mockCluster.label, "-kubeconfig.yaml");
        cy.visitWithLogin(url);
        cy.wait(['@getCluster']);
        cy.findByText(mockKubeconfigFilename)
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@getKubeconfig');
        (0, downloads_1.readDownload)(mockKubeconfigFilename).should('eq', mockKubeconfigContents);
    });
    it('can view kubeconfig contents', function () {
        cy.visitWithLogin(url);
        cy.wait(['@getCluster']);
        // open drawer
        cy.get('p:contains("View")')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@getKubeconfig');
        ui_1.ui.drawer.findByTitle('View Kubeconfig').should('be.visible');
        cy.get('code')
            .should('be.visible')
            .within(function () {
            cy.get('span').contains(mockKubeconfigContents);
        });
    });
    /*
     * - Confirms users can add tags to a cluster in the LKE summary page.
     * - Confirms that an update API request has been sent.
     */
    it('can add tags to a cluster by clicking "Add a Tag" button in summary page', function () {
        var mockACL = factories_1.kubernetesControlPlaneACLFactory.build({
            acl: {
                enabled: false,
            },
        });
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: lke_1.latestKubernetesVersion,
            control_plane: mockACL,
        });
        var tag = (0, random_1.randomLabel)();
        var mockClusterUpdated = __assign(__assign({}, mockCluster), { tags: [tag] });
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
        (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
        (0, lke_2.mockGetApiEndpoints)(mockCluster.id).as('getApiEndpoints');
        (0, lke_2.mockGetDashboardUrl)(mockCluster.id).as('getDashboardUrl');
        (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, mockACL).as('getControlPlaneACL');
        (0, lke_2.mockUpdateCluster)(mockCluster.id, mockClusterUpdated).as('updateCluster');
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
        cy.wait([
            '@getCluster',
            '@getNodePools',
            '@getVersions',
            '@getApiEndpoints',
            '@getDashboardUrl',
        ]);
        // LKE clusters can add tags from summary page
        cy.get('[data-qa-kube-entity-footer]').within(function () {
            cy.findByText('Add a tag').click();
        });
        cy.get('[data-qa-autocomplete="Create or Select a Tag"]')
            .should('be.visible')
            .clear();
        cy.focused().type("".concat(tag));
        cy.findByText("Create \"".concat(tag, "\"")).should('be.visible').click();
        // Confirms that a put request is sent
        cy.wait('@updateCluster').then(function (xhr) {
            var _a;
            var data = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body;
            if (data) {
                expect(data.tags).to.deep.equal(mockClusterUpdated.tags);
            }
        });
        // Confirms that the new tag shows up
        cy.get("[data-qa-tag=\"".concat(tag, "\"]")).should('be.visible');
    });
    /*
     * - Confirms users can add tags to a cluster in the tags drawer.
     * - Confirms that an update API request has been sent.
     */
    it('can add tags to a cluster by clicking "Add a Tag" button in tags drawer', function () {
        var mockACL = factories_1.kubernetesControlPlaneACLFactory.build({
            acl: {
                enabled: false,
            },
        });
        var tagsExisting = buildTags(5);
        var tagNew = (0, random_1.randomLabel)();
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: lke_1.latestKubernetesVersion,
            control_plane: mockACL,
            tags: tagsExisting,
        });
        var mockClusterUpdated = __assign(__assign({}, mockCluster), { tags: __spreadArray(__spreadArray([], tagsExisting, true), [tagNew], false) });
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
        (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
        (0, lke_2.mockGetApiEndpoints)(mockCluster.id).as('getApiEndpoints');
        (0, lke_2.mockGetDashboardUrl)(mockCluster.id).as('getDashboardUrl');
        (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, mockACL).as('getControlPlaneACL');
        (0, lke_2.mockUpdateCluster)(mockCluster.id, mockClusterUpdated).as('updateCluster');
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
        cy.wait([
            '@getCluster',
            '@getNodePools',
            '@getVersions',
            '@getApiEndpoints',
            '@getDashboardUrl',
        ]);
        // Confirms that button "Display all tags" (i.e., "...") shows up and opens the tags drawer
        cy.get('[aria-label="Display all tags"]').should('be.visible').click();
        ui_1.ui.drawer
            .findByTitle("Tags (".concat(mockCluster.label, ")"))
            .should('be.visible')
            .within(function () {
            tagsExisting.forEach(function (tag) {
                cy.findByText(tag).should('be.visible');
            });
            // LKE clusters can add tags from tags drawer
            cy.findByText('Add a tag').click();
            cy.get('[data-qa-autocomplete="Create or Select a Tag"]')
                .should('be.visible')
                .clear();
            cy.focused().type("".concat(tagNew));
            cy.findByText("Create \"".concat(tagNew, "\"")).should('be.visible').click();
            // Confirms that a put request is sent
            cy.wait('@updateCluster').then(function (xhr) {
                var _a;
                var data = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body;
                if (data) {
                    expect(data.tags).to.deep.equal(mockClusterUpdated.tags);
                }
            });
            // New tag should exist
            cy.findByText(tagNew).should('be.visible');
        });
    });
    /*
     * - Confirms users can remove tags in the landing page.
     * - Confirms that an update API request has been sent.
     */
    it('can remove tags to a cluster by clicking "X" button next to the tag in the landing page', function () {
        var mockACL = factories_1.kubernetesControlPlaneACLFactory.build({
            acl: {
                enabled: false,
            },
        });
        var tagExisting = (0, random_1.randomLabel)();
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: lke_1.latestKubernetesVersion,
            control_plane: mockACL,
            tags: [tagExisting],
        });
        var mockClusterUpdated = __assign(__assign({}, mockCluster), { tags: [] });
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
        (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
        (0, lke_2.mockGetApiEndpoints)(mockCluster.id).as('getApiEndpoints');
        (0, lke_2.mockGetDashboardUrl)(mockCluster.id).as('getDashboardUrl');
        (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, mockACL).as('getControlPlaneACL');
        (0, lke_2.mockUpdateCluster)(mockCluster.id, mockClusterUpdated).as('updateCluster');
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
        cy.wait([
            '@getCluster',
            '@getNodePools',
            '@getVersions',
            '@getApiEndpoints',
            '@getDashboardUrl',
        ]);
        // Confirms that the "..." button does not exist if only one tag exists
        cy.get('[aria-label="Display all tags"]').should('not.exist');
        cy.get("[data-qa-tag=\"".concat(tagExisting, "\"]"))
            .should('be.visible')
            .within(function () {
            cy.get("[aria-label=\"Delete Tag '".concat(tagExisting, "'\"]"))
                .should('be.visible')
                .click();
        });
        // Confirms that the tag should not present in the summary page.
        cy.get("[data-qa-tag=\"".concat(tagExisting, "\"]")).should('not.exist');
    });
    /*
     * - Confirms users can remove tags from tags drawer.
     * - Confirms that an update API request has been sent.
     */
    it('can remove tags to a cluster by clicking "X" button next to the tag in tags drawer', function () {
        var mockACL = factories_1.kubernetesControlPlaneACLFactory.build({
            acl: {
                enabled: false,
            },
        });
        var tagsExisting = buildTags(2);
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: lke_1.latestKubernetesVersion,
            control_plane: mockACL,
            tags: tagsExisting,
        });
        var mockClusterUpdated = __assign(__assign({}, mockCluster), { tags: [tagsExisting[1]] });
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
        (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
        (0, lke_2.mockGetApiEndpoints)(mockCluster.id).as('getApiEndpoints');
        (0, lke_2.mockGetDashboardUrl)(mockCluster.id).as('getDashboardUrl');
        (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, mockACL).as('getControlPlaneACL');
        (0, lke_2.mockUpdateCluster)(mockCluster.id, mockClusterUpdated).as('updateCluster');
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
        cy.wait([
            '@getCluster',
            '@getNodePools',
            '@getVersions',
            '@getApiEndpoints',
            '@getDashboardUrl',
        ]);
        // Confirms that the tags drawer shows up
        cy.get('[aria-label="Display all tags"]').should('be.visible').click();
        ui_1.ui.drawer
            .findByTitle("Tags (".concat(mockCluster.label, ")"))
            .should('be.visible')
            .within(function () {
            // Confirms that each tag is visible
            tagsExisting.forEach(function (tag) {
                cy.get("[data-qa-tag=\"".concat(tag, "\"]")).should('be.visible');
            });
            cy.get("[data-qa-tag=\"".concat(tagsExisting[0], "\"]"))
                .should('be.visible')
                .within(function () {
                // LKE clusters can remove tags from tags drawer
                cy.get("[aria-label=\"Delete Tag '".concat(tagsExisting[0], "'\"]"))
                    .should('be.visible')
                    .click();
                // Confirms that a put request is sent
                cy.wait('@updateCluster').then(function (xhr) {
                    var _a;
                    var data = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body;
                    if (data) {
                        expect(data.tags).to.deep.equal([tagsExisting[1]]);
                    }
                });
            });
            // The tag is removed
            cy.findByText(tagsExisting[0]).should('not.exist');
            // Close the tags drawer
            cy.get('[aria-label="Close drawer"]').click();
        });
        // Confirms that the tag should not present in the summary page.
        cy.get('[aria-label="Display all tags"]').should('not.exist');
    });
    // TODO: add test for failure to download yaml file
});
