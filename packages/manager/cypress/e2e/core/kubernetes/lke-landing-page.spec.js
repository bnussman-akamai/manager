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
var lke_1 = require("support/intercepts/lke");
var factories_1 = require("src/factories");
var regions_1 = require("support/util/regions");
var downloads_1 = require("support/util/downloads");
var ui_1 = require("support/ui");
var feature_flags_1 = require("support/intercepts/feature-flags");
var account_1 = require("support/intercepts/account");
describe('LKE landing page', function () {
    it('does not display a Disk Encryption info banner if the LDE feature is disabled', function () {
        // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeDiskEncryption: false,
        }).as('getFeatureFlags');
        // Mock responses
        var mockAccount = factories_1.accountFactory.build({
            capabilities: ['Linodes', 'Disk Encryption'],
        });
        var mockCluster = factories_1.kubernetesClusterFactory.build();
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
        (0, lke_1.mockGetClusters)([mockCluster]).as('getClusters');
        // Intercept request
        cy.visitWithLogin('/kubernetes/clusters');
        cy.wait(['@getClusters', '@getAccount']);
        // Wait for page to load before confirming that banner is not present.
        cy.findByText(mockCluster.label).should('be.visible');
        cy.findByText('Disk encryption is now standard on Linodes.').should('not.exist');
    });
    it('displays a Disk Encryption info banner if the LDE feature is enabled', function () {
        // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeDiskEncryption: true,
        }).as('getFeatureFlags');
        // Mock responses
        var mockAccount = factories_1.accountFactory.build({
            capabilities: ['Linodes', 'Disk Encryption'],
        });
        var mockClusters = factories_1.kubernetesClusterFactory.buildList(3);
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
        (0, lke_1.mockGetClusters)(mockClusters).as('getClusters');
        // Intercept request
        cy.visitWithLogin('/kubernetes/clusters');
        cy.wait(['@getClusters', '@getAccount']);
        // Check if banner is visible
        cy.contains('Disk encryption is now standard on Linodes.').should('be.visible');
    });
    /*
     * - Confirms that LKE clusters are listed on landing page.
     */
    it('lists LKE clusters', function () {
        var mockClusters = factories_1.kubernetesClusterFactory.buildList(10);
        (0, lke_1.mockGetClusters)(mockClusters).as('getClusters');
        mockClusters.forEach(function (cluster) {
            (0, lke_1.mockGetClusterPools)(cluster.id, factories_1.nodePoolFactory.buildList(3));
        });
        cy.visitWithLogin('/kubernetes/clusters');
        cy.wait('@getClusters');
        mockClusters.forEach(function (cluster) {
            cy.findByText(cluster.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText((0, regions_1.getRegionById)(cluster.region).label).should('be.visible');
                cy.findByText(cluster.k8s_version).should('be.visible');
                ui_1.ui.button
                    .findByTitle('Download kubeconfig')
                    .should('be.visible')
                    .should('be.enabled');
                ui_1.ui.button
                    .findByTitle('Delete')
                    .should('be.visible')
                    .should('be.enabled');
            });
        });
    });
    /*
     * - Confirms that welcome page is shown when no LKE clusters exist.
     * - Confirms that core page elements (create button, guides, playlist, etc.) are present.
     */
    it('shows welcome page when there are no LKE clusters', function () {
        (0, lke_1.mockGetClusters)([]).as('getClusters');
        cy.visitWithLogin('/kubernetes/clusters');
        cy.wait('@getClusters');
        cy.findByText('Fully managed Kubernetes infrastructure').should('be.visible');
        ui_1.ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled');
        cy.findByText('Getting Started Guides').should('be.visible');
        cy.findByText('Video Playlist').should('be.visible');
    });
    /*
     * - Confirms UI flow for Kubeconfig file downloading using mocked data.
     * - Confirms that downloaded Kubeconfig contains expected content.
     */
    it('can download kubeconfig', function () {
        var mockCluster = factories_1.kubernetesClusterFactory.build();
        var mockClusterNodePools = factories_1.nodePoolFactory.buildList(2);
        var mockKubeconfigFilename = "".concat(mockCluster.label, "-kubeconfig.yaml");
        var mockKubeconfigContents = '---'; // Valid YAML.
        var mockKubeconfigResponse = {
            kubeconfig: btoa(mockKubeconfigContents),
        };
        (0, lke_1.mockGetClusters)([mockCluster]).as('getClusters');
        (0, lke_1.mockGetClusterPools)(mockCluster.id, mockClusterNodePools).as('getNodePools');
        (0, lke_1.mockGetKubeconfig)(mockCluster.id, mockKubeconfigResponse).as('getKubeconfig');
        cy.visitWithLogin('/kubernetes/clusters');
        cy.wait(['@getClusters', '@getNodePools']);
        cy.findByText(mockCluster.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Download kubeconfig')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@getKubeconfig');
        (0, downloads_1.readDownload)(mockKubeconfigFilename).should('eq', mockKubeconfigContents);
    });
    it('does not show an Upgrade chip when there is no new kubernetes standard version', function () {
        var oldVersion = '1.25';
        var newVersion = '1.26';
        var cluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: newVersion,
        });
        (0, lke_1.mockGetClusters)([cluster]).as('getClusters');
        (0, lke_1.mockGetKubernetesVersions)([newVersion, oldVersion]).as('getVersions');
        cy.visitWithLogin("/kubernetes/clusters");
        cy.wait(['@getClusters', '@getVersions']);
        cy.findByText(newVersion).should('be.visible');
        cy.findByText('UPGRADE').should('not.exist');
    });
    it('does not show an Upgrade chip when there is no new kubernetes enterprise version', function () {
        var oldVersion = '1.31.1+lke1';
        var newVersion = '1.32.1+lke2';
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: ['Kubernetes Enterprise'],
        })).as('getAccount');
        // TODO LKE-E: Remove once feature is in GA
        (0, feature_flags_1.mockAppendFeatureFlags)({
            lkeEnterprise: { enabled: true, la: true },
        });
        var cluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: newVersion,
            tier: 'enterprise',
        });
        (0, lke_1.mockGetClusters)([cluster]).as('getClusters');
        (0, lke_1.mockGetTieredKubernetesVersions)('enterprise', [
            { id: newVersion, tier: 'enterprise' },
            { id: oldVersion, tier: 'enterprise' },
        ]).as('getTieredVersions');
        cy.visitWithLogin("/kubernetes/clusters");
        cy.wait(['@getAccount', '@getClusters', '@getTieredVersions']);
        cy.findByText(newVersion).should('be.visible');
        cy.findByText('UPGRADE').should('not.exist');
    });
    it('can upgrade the standard kubernetes version from the landing page', function () {
        var oldVersion = '1.25';
        var newVersion = '1.26';
        var cluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: oldVersion,
        });
        var updatedCluster = __assign(__assign({}, cluster), { k8s_version: newVersion });
        (0, lke_1.mockGetClusters)([cluster]).as('getClusters');
        (0, lke_1.mockGetKubernetesVersions)([newVersion, oldVersion]).as('getVersions');
        (0, lke_1.mockUpdateCluster)(cluster.id, updatedCluster).as('updateCluster');
        (0, lke_1.mockRecycleAllNodes)(cluster.id).as('recycleAllNodes');
        cy.visitWithLogin("/kubernetes/clusters");
        cy.wait(['@getClusters', '@getVersions']);
        cy.findByText(oldVersion).should('be.visible');
        cy.findByText('UPGRADE').should('be.visible').should('be.enabled').click();
        ui_1.ui.dialog
            .findByTitle("Upgrade Kubernetes version to ".concat(newVersion, " on ").concat(cluster.label, "?"))
            .should('be.visible');
        (0, lke_1.mockGetClusters)([updatedCluster]).as('getClusters');
        ui_1.ui.button
            .findByTitle('Upgrade Version')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait(['@updateCluster', '@getClusters']);
        ui_1.ui.dialog.findByTitle('Upgrade complete').should('be.visible');
        ui_1.ui.button
            .findByTitle('Recycle All Nodes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@recycleAllNodes');
        ui_1.ui.toast.assertMessage('Recycle started successfully.');
        cy.findByText(newVersion).should('be.visible');
    });
    it('can upgrade the enterprise kubernetes version from the landing page', function () {
        var oldVersion = '1.31.1+lke1';
        var newVersion = '1.32.1+lke2';
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: ['Kubernetes Enterprise'],
        })).as('getAccount');
        // TODO LKE-E: Remove once feature is in GA
        (0, feature_flags_1.mockAppendFeatureFlags)({
            lkeEnterprise: { enabled: true, la: true },
        });
        var cluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: oldVersion,
            tier: 'enterprise',
        });
        var updatedCluster = __assign(__assign({}, cluster), { k8s_version: newVersion });
        (0, lke_1.mockGetClusters)([cluster]).as('getClusters');
        (0, lke_1.mockGetTieredKubernetesVersions)('enterprise', [
            { id: newVersion, tier: 'enterprise' },
            { id: oldVersion, tier: 'enterprise' },
        ]).as('getTieredVersions');
        (0, lke_1.mockUpdateCluster)(cluster.id, updatedCluster).as('updateCluster');
        (0, lke_1.mockRecycleAllNodes)(cluster.id).as('recycleAllNodes');
        cy.visitWithLogin("/kubernetes/clusters");
        cy.wait(['@getAccount', '@getClusters', '@getTieredVersions']);
        cy.findByText(oldVersion).should('be.visible');
        cy.findByText('UPGRADE').should('be.visible').should('be.enabled').click();
        ui_1.ui.dialog
            .findByTitle("Upgrade Kubernetes version to ".concat(newVersion, " on ").concat(cluster.label, "?"))
            .should('be.visible');
        (0, lke_1.mockGetClusters)([updatedCluster]).as('getClusters');
        ui_1.ui.button
            .findByTitle('Upgrade Version')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait(['@updateCluster', '@getClusters']);
        ui_1.ui.dialog.findByTitle('Upgrade complete').should('be.visible');
        ui_1.ui.button
            .findByTitle('Recycle All Nodes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@recycleAllNodes');
        ui_1.ui.toast.assertMessage('Recycle started successfully.');
        cy.findByText(newVersion).should('be.visible');
    });
});
