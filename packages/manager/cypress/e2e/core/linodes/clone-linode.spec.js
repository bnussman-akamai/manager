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
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var linodes_1 = require("support/intercepts/linodes");
var pages_1 = require("support/ui/pages");
var vlans_1 = require("support/intercepts/vlans");
var ui_1 = require("support/ui");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var regions_1 = require("support/util/regions");
var random_1 = require("support/util/random");
var authentication_1 = require("support/api/authentication");
var cleanup_1 = require("support/util/cleanup");
var linodes_2 = require("support/util/linodes");
var linodes_3 = require("support/constants/linodes");
var configs_1 = require("support/intercepts/configs");
var feature_flags_1 = require("support/intercepts/feature-flags");
/**
 * Returns the Cloud Manager URL to clone a given Linode.
 *
 * @param linode - Linode for which to retrieve clone URL.
 *
 * @returns Cloud Manager Clone URL for Linode.
 */
var getLinodeCloneUrl = function (linode) {
    var regionQuery = "&regionID=".concat(linode.region);
    var typeQuery = linode.type ? "&typeID=".concat(linode.type) : '';
    return "/linodes/create?linodeID=".concat(linode.id).concat(regionQuery, "&type=Clone+Linode").concat(typeQuery);
};
(0, authentication_1.authenticate)();
describe('clone linode', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('linodes');
    });
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeInterfaces: { enabled: false },
        });
    });
    /*
     * - Confirms Linode Clone flow via the Linode details page.
     * - Confirms that Linode can be cloned successfully.
     */
    it('can clone a Linode from Linode details page', function () {
        cy.tag('method:e2e', 'purpose:dcTesting');
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['Vlans'] });
        var linodePayload = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
            booted: false,
            type: 'g6-nanode-1',
        });
        var newLinodeLabel = "".concat(linodePayload.label, "-clone");
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to interact with it shortly after booting up when the
        // Linode is attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_2.createTestLinode)(linodePayload, { securityMethod: 'vlan_no_internet' });
        }).then(function (linode) {
            (0, linodes_1.interceptCloneLinode)(linode.id).as('cloneLinode');
            cy.visitWithLogin("/linodes/".concat(linode.id));
            // Wait for Linode to boot, then initiate clone flow.
            cy.findByText('OFFLINE', { timeout: linodes_3.LINODE_CREATE_TIMEOUT }).should('be.visible');
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .should('be.visible')
                .click();
            ui_1.ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();
            cy.url().should('endWith', getLinodeCloneUrl(linode));
            // Select clone region and Linode type.
            ui_1.ui.regionSelect.find().click();
            ui_1.ui.regionSelect.findItemByRegionId(linodeRegion.id).click();
            cy.findByText('Shared CPU').should('be.visible').click();
            cy.get('[id="g6-standard-1"]')
                .closest('[data-qa-radio]')
                .should('be.visible')
                .click();
            // Confirm summary displays expected information and begin clone.
            cy.findByText("Summary ".concat(newLinodeLabel)).should('be.visible');
            ui_1.ui.button
                .findByTitle('Create Linode')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@cloneLinode').then(function (xhr) {
                var _a, _b, _c;
                var newLinodeId = (_b = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.id;
                assert.equal((_c = xhr.response) === null || _c === void 0 ? void 0 : _c.statusCode, 200);
                cy.url().should('endWith', "linodes/".concat(newLinodeId));
            });
            ui_1.ui.toast.assertMessage("Your Linode ".concat(newLinodeLabel, " is being created."));
            ui_1.ui.toast.assertMessage("Linode ".concat(linode.label, " has been cloned to ").concat(newLinodeLabel, "."), { timeout: linodes_3.LINODE_CLONE_TIMEOUT });
        });
    });
    /*
     * - Confirms Linode Clone flow can handle null type gracefully.
     * - Confirms that Linode (mock) can be cloned successfully.
     */
    it('can clone a Linode with null type', function () {
        var mockLinodeRegion = (0, regions_1.chooseRegion)({
            capabilities: ['Linodes', 'Vlans'],
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockLinodeRegion.id,
            status: 'offline',
            type: null,
        });
        var mockVolume = factories_1.volumeFactory.build();
        var mockPublicConfigInterface = factories_1.LinodeConfigInterfaceFactory.build({
            ipam_address: null,
            purpose: 'public',
        });
        var mockConfig = factories_1.linodeConfigFactory.build({
            id: (0, random_1.randomNumber)(),
            interfaces: [
                // The order of this array is significant. Index 0 (eth0) should be public.
                mockPublicConfigInterface,
            ],
        });
        var mockVlan = factories_1.VLANFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockLinodeRegion.id,
            cidr_block: "".concat((0, random_1.randomIp)(), "/24"),
            linodes: [],
        });
        var linodeNullTypePayload = factories_1.createLinodeRequestFactory.build({
            label: mockLinode.label,
            region: mockLinodeRegion.id,
            booted: false,
        });
        var newLinodeLabel = "".concat(linodeNullTypePayload.label, "-clone");
        var clonedLinode = __assign(__assign({}, mockLinode), { id: mockLinode.id + 1, label: newLinodeLabel });
        (0, vlans_1.mockGetVLANs)([mockVlan]);
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, linodes_1.mockGetLinodeVolumes)(clonedLinode.id, [mockVolume]).as('getLinodeVolumes');
        (0, configs_1.mockGetLinodeConfigs)(clonedLinode.id, [mockConfig]).as('getLinodeConfigs');
        cy.visitWithLogin('/linodes/create');
        // Fill out necessary Linode create fields.
        pages_1.linodeCreatePage.selectRegionById(mockLinodeRegion.id);
        pages_1.linodeCreatePage.selectImage('Debian 11');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Open VLAN accordion and select existing VLAN.
        ui_1.ui.accordionHeading.findByTitle('VLAN').click();
        ui_1.ui.accordion
            .findByTitle('VLAN')
            .scrollIntoView()
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('VLAN').should('be.enabled').type(mockVlan.label);
            ui_1.ui.autocompletePopper
                .findByTitle(mockVlan.label)
                .should('be.visible')
                .click();
            cy.findByLabelText(/IPAM Address/)
                .should('be.enabled')
                .type(mockVlan.cidr_block);
        });
        // Confirm that VLAN attachment is listed in summary, then create Linode.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('VLAN Attached').should('be.visible');
        });
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm outgoing API request payload has expected data.
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var expectedPublicInterface = requestPayload['interfaces'][0];
            var expectedVlanInterface = requestPayload['interfaces'][1];
            // Confirm that first interface is for public internet.
            expect(expectedPublicInterface['purpose']).to.equal('public');
            // Confirm that second interface is our chosen VLAN.
            expect(expectedVlanInterface['purpose']).to.equal('vlan');
            expect(expectedVlanInterface['label']).to.equal(mockVlan.label);
            expect(expectedVlanInterface['ipam_address']).to.equal(mockVlan.cidr_block);
        });
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
        (0, linodes_1.mockCloneLinode)(mockLinode.id, clonedLinode).as('cloneLinode');
        cy.visitWithLogin("/linodes/".concat(mockLinode.id));
        // Wait for Linode to boot, then initiate clone flow.
        cy.findByText('OFFLINE').should('be.visible');
        ui_1.ui.actionMenu
            .findByTitle("Action menu for Linode ".concat(mockLinode.label))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();
        cy.url().should('endWith', getLinodeCloneUrl(mockLinode));
        // Select clone region and Linode type.
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionId(mockLinodeRegion.id).click();
        cy.findByText('Shared CPU').should('be.visible').click();
        cy.get('[id="g6-standard-1"]')
            .closest('[data-qa-radio]')
            .should('be.visible')
            .click();
        // Confirm summary displays expected information and begin clone.
        cy.findByText("Summary ".concat(newLinodeLabel)).should('be.visible');
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@cloneLinode').then(function (xhr) {
            var _a, _b, _c;
            var newLinodeId = (_b = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.id;
            assert.equal((_c = xhr.response) === null || _c === void 0 ? void 0 : _c.statusCode, 200);
            cy.url().should('endWith', "linodes/".concat(newLinodeId));
        });
        cy.wait(['@getLinodeVolumes', '@getLinodeConfigs']);
        ui_1.ui.toast.assertMessage("Your Linode ".concat(newLinodeLabel, " is being created."));
    });
    /*
     * - Confirms DC-specific pricing UI flow works as expected during Linode clone.
     * - Confirms that pricing docs link is shown in "Region" section.
     * - Confirms that notice is shown when selecting a region with a different price structure.
     */
    it('shows DC-specific pricing information during clone flow', function () {
        var initialRegion = (0, regions_1.getRegionById)('us-west');
        var newRegion = (0, regions_1.getRegionById)('us-east');
        var mockLinode = factories_1.linodeFactory.build({
            region: initialRegion.id,
            type: dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id,
        });
        (0, linodes_1.mockGetLinodes)([mockLinode]).as('getLinodes');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        // Mock requests to get all Linode types, and to get individual types.
        (0, linodes_1.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[0]);
        (0, linodes_1.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[1]);
        (0, linodes_1.mockGetLinodeTypes)(dc_specific_pricing_1.dcPricingMockLinodeTypes).as('getLinodeTypes');
        cy.visitWithLogin(getLinodeCloneUrl(mockLinode));
        cy.wait(['@getLinode', '@getLinodes', '@getLinodeTypes']);
        // Confirm there is a docs link to the pricing page.
        cy.findByText(dc_specific_pricing_1.dcPricingDocsLabel)
            .should('be.visible')
            .should('have.attr', 'href', dc_specific_pricing_1.dcPricingDocsUrl);
        // Confirm that DC-specific pricing difference notice is not yet shown.
        cy.findByText(dc_specific_pricing_1.dcPricingRegionDifferenceNotice, { exact: false }).should('not.exist');
        ui_1.ui.regionSelect
            .findBySelectedItem("".concat(initialRegion.label, " (").concat(initialRegion.id, ")"))
            .click()
            .type("".concat(newRegion.label, "{enter}"));
        cy.findByText(dc_specific_pricing_1.dcPricingRegionDifferenceNotice, { exact: false }).should('be.visible');
    });
});
