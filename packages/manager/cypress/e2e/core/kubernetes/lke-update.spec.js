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
var extendType_1 = require("src/utilities/extendType");
var account_1 = require("support/intercepts/account");
var lke_1 = require("support/constants/lke");
var lke_2 = require("support/intercepts/lke");
var linodes_1 = require("support/intercepts/linodes");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var feature_flags_1 = require("support/intercepts/feature-flags");
var random_2 = require("support/util/random");
var arrays_1 = require("support/util/arrays");
var luxon_1 = require("luxon");
var mockNodePools = factories_1.nodePoolFactory.buildList(2);
describe('LKE cluster updates', function () {
    // TODO Add LKE update tests to cover flows when APL is enabled.
    describe('APL disabled', function () {
        beforeEach(function () {
            // Mock the APL feature flag to be disabled.
            (0, feature_flags_1.mockAppendFeatureFlags)({
                apl: false,
            });
        });
        /*
         * - Confirms UI flow of upgrading a cluster to high availability control plane using mocked data.
         * - Confirms that user is shown a warning and agrees to billing changes before upgrading.
         * - Confirms that details page updates accordingly after upgrading to high availability.
         */
        it('can upgrade to high availability', function () {
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
                control_plane: {
                    high_availability: false,
                },
            });
            var mockClusterWithHA = __assign(__assign({}, mockCluster), { control_plane: {
                    high_availability: true,
                } });
            var haUpgradeWarnings = [
                'All nodes will be deleted and new nodes will be created to replace them.',
                'Any data stored within local storage of your node(s) (such as ’hostPath’ volumes) is deleted.',
                'This may take several minutes, as nodes will be replaced on a rolling basis.',
            ];
            var haUpgradeAgreement = 'I agree to the additional fee on my monthly bill and understand HA upgrade can only be reversed by deleting my cluster';
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockUpdateCluster)(mockCluster.id, mockClusterWithHA).as('updateCluster');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getCluster', '@getNodePools', '@getVersions']);
            // Initiate high availability upgrade and agree to changes.
            ui_1.ui.button
                .findByTitle('Upgrade to HA')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle('Upgrade to High Availability')
                .should('be.visible')
                .within(function () {
                haUpgradeWarnings.forEach(function (warning) {
                    cy.findByText(warning).should('be.visible');
                });
                cy.findByText(haUpgradeAgreement, { exact: false })
                    .should('be.visible')
                    .closest('label')
                    .click();
                ui_1.ui.button
                    .findByTitle('Upgrade to HA')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm toast message appears and HA Cluster chip is shown.
            cy.wait('@updateCluster');
            ui_1.ui.toast.assertMessage('Enabled HA Control Plane');
            cy.findByText('HA CLUSTER').should('be.visible');
            cy.findByText('Upgrade to HA').should('not.exist');
        });
        /*
         * - Confirms UI flow of upgrading Kubernetes version using mocked API requests.
         * - Confirms that Kubernetes upgrade prompt is shown when not up-to-date.
         * - Confirms that Kubernetes upgrade prompt is hidden when up-to-date.
         */
        it('can upgrade standard kubernetes version from the details page', function () {
            var oldVersion = '1.25';
            var newVersion = '1.26';
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: oldVersion,
            });
            var mockClusterUpdated = __assign(__assign({}, mockCluster), { k8s_version: newVersion });
            var upgradePrompt = 'A new version of Kubernetes is available (1.26).';
            var upgradeNotes = [
                'This upgrades the control plane on your cluster and ensures that any new worker nodes are created using the newer Kubernetes version.',
                // Confirm that the old version and new version are both shown.
                oldVersion,
                newVersion,
            ];
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetKubernetesVersions)([newVersion, oldVersion]).as('getVersions');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
            (0, lke_2.mockUpdateCluster)(mockCluster.id, mockClusterUpdated).as('updateCluster');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getCluster', '@getNodePools', '@getVersions']);
            // Confirm that upgrade prompt is shown.
            cy.findByText(upgradePrompt).should('be.visible');
            ui_1.ui.button
                .findByTitle('Upgrade Version')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle("Upgrade Kubernetes version to ".concat(newVersion, " on ").concat(mockCluster.label, "?"))
                .should('be.visible')
                .within(function () {
                upgradeNotes.forEach(function (note) {
                    cy.findAllByText(note, { exact: false }).should('be.visible');
                });
                ui_1.ui.button
                    .findByTitle('Upgrade Version')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Wait for API response and assert toast message is shown.
            cy.wait('@updateCluster');
            // Verify the banner goes away because the version update has happened
            cy.findByText(upgradePrompt).should('not.exist');
            (0, lke_2.mockRecycleAllNodes)(mockCluster.id).as('recycleAllNodes');
            var stepTwoDialogTitle = 'Upgrade complete';
            ui_1.ui.dialog
                .findByTitle(stepTwoDialogTitle)
                .should('be.visible')
                .within(function () {
                cy.findByText('The cluster’s Kubernetes version has been updated successfully', {
                    exact: false,
                }).should('be.visible');
                cy.findByText('To upgrade your existing worker nodes, you can recycle all nodes (which may have a performance impact) or perform other upgrade methods.', { exact: false }).should('be.visible');
                ui_1.ui.button
                    .findByTitle('Recycle All Nodes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Verify clicking the "Recycle All Nodes" makes an API call
            cy.wait('@recycleAllNodes');
            // Verify the upgrade dialog closed
            cy.findByText(stepTwoDialogTitle).should('not.exist');
            // Verify the banner is still gone after the flow
            cy.findByText(upgradePrompt).should('not.exist');
            // Verify the version is correct after the update
            cy.findByText("Version ".concat(newVersion));
            ui_1.ui.toast.findByMessage('Recycle started successfully.');
        });
        /*
         * - Confirms UI flow of upgrading Kubernetes enterprise version using mocked API requests.
         * - Confirms that Kubernetes upgrade prompt is shown when not up-to-date.
         * - Confirms that Kubernetes upgrade prompt is hidden when up-to-date.
         */
        it('can upgrade enterprise kubernetes version from the details page', function () {
            var oldVersion = '1.31.1+lke1';
            var newVersion = '1.31.1+lke2';
            (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
                capabilities: ['Kubernetes Enterprise'],
            })).as('getAccount');
            // TODO LKE-E: Remove once feature is in GA
            (0, feature_flags_1.mockAppendFeatureFlags)({
                lkeEnterprise: { enabled: true, la: true },
            });
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: oldVersion,
                tier: 'enterprise',
            });
            var mockClusterUpdated = __assign(__assign({}, mockCluster), { k8s_version: newVersion });
            var upgradePrompt = 'A new version of Kubernetes is available (1.31.1+lke2).';
            var upgradeNotes = [
                'This upgrades the control plane on your cluster and ensures that any new worker nodes are created using the newer Kubernetes version.',
                // Confirm that the old version and new version are both shown.
                oldVersion,
                newVersion,
            ];
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetTieredKubernetesVersions)('enterprise', [
                { id: newVersion, tier: 'enterprise' },
                { id: oldVersion, tier: 'enterprise' },
            ]).as('getTieredVersions');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
            (0, lke_2.mockUpdateCluster)(mockCluster.id, mockClusterUpdated).as('updateCluster');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait([
                '@getAccount',
                '@getCluster',
                '@getNodePools',
                '@getTieredVersions',
            ]);
            // Confirm that upgrade prompt is shown.
            cy.findByText(upgradePrompt).should('be.visible');
            ui_1.ui.button
                .findByTitle('Upgrade Version')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle("Upgrade Kubernetes version to ".concat(newVersion, " on ").concat(mockCluster.label, "?"))
                .should('be.visible')
                .within(function () {
                upgradeNotes.forEach(function (note) {
                    cy.findAllByText(note, { exact: false }).should('be.visible');
                });
                ui_1.ui.button
                    .findByTitle('Upgrade Version')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Wait for API response and assert toast message is shown.
            cy.wait('@updateCluster');
            // Verify the banner goes away because the version update has happened
            cy.findByText(upgradePrompt).should('not.exist');
            (0, lke_2.mockRecycleAllNodes)(mockCluster.id).as('recycleAllNodes');
            var stepTwoDialogTitle = 'Upgrade complete';
            ui_1.ui.dialog
                .findByTitle(stepTwoDialogTitle)
                .should('be.visible')
                .within(function () {
                cy.findByText('The cluster’s Kubernetes version has been updated successfully', {
                    exact: false,
                }).should('be.visible');
                cy.findByText('To upgrade your existing worker nodes, you can recycle all nodes (which may have a performance impact) or perform other upgrade methods.', { exact: false }).should('be.visible');
                ui_1.ui.button
                    .findByTitle('Recycle All Nodes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Verify clicking the "Recycle All Nodes" makes an API call
            cy.wait('@recycleAllNodes');
            // Verify the upgrade dialog closed
            cy.findByText(stepTwoDialogTitle).should('not.exist');
            // Verify the banner is still gone after the flow
            cy.findByText(upgradePrompt).should('not.exist');
            // Verify the version is correct after the update
            cy.findByText("Version ".concat(newVersion));
            ui_1.ui.toast.findByMessage('Recycle started successfully.');
        });
        /*
         * - Confirms node, node pool, and cluster recycling UI flow using mocked API data.
         * - Confirms that user is warned that recycling recreates nodes and may take a while.
         */
        it('can recycle nodes', function () {
            var _a;
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
            });
            var mockKubeLinode = factories_1.kubeLinodeFactory.build();
            var mockNodePool = factories_1.nodePoolFactory.build({
                count: 1,
                type: 'g6-standard-1',
                nodes: [mockKubeLinode],
            });
            var mockLinode = factories_1.linodeFactory.build({
                label: (0, random_1.randomLabel)(),
                id: (_a = mockKubeLinode.instance_id) !== null && _a !== void 0 ? _a : undefined,
            });
            var recycleWarningSubstrings = [
                'Any data stored within local storage of your node(s) (such as ’hostPath’ volumes) is deleted',
                'using local storage for important data is not common or recommended',
            ];
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool]).as('getNodePools');
            (0, linodes_1.mockGetLinodes)([mockLinode]).as('getLinodes');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getCluster', '@getNodePools', '@getLinodes', '@getVersions']);
            // Recycle individual node.
            ui_1.ui.button
                .findByTitle('Recycle')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockRecycleNode)(mockCluster.id, mockKubeLinode.id).as('recycleNode');
            ui_1.ui.dialog
                .findByTitle("Recycle ".concat(mockKubeLinode.id, "?"))
                .should('be.visible')
                .within(function () {
                cy.findByText('Delete and recreate this node.', {
                    exact: false,
                }).should('be.visible');
                recycleWarningSubstrings.forEach(function (warning) {
                    cy.findByText(warning, { exact: false }).should('be.visible');
                });
                ui_1.ui.button
                    .findByTitle('Recycle')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@recycleNode');
            ui_1.ui.toast.assertMessage('Node queued for recycling.');
            ui_1.ui.button
                .findByTitle('Recycle Pool Nodes')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockRecycleNodePool)(mockCluster.id, mockNodePool.id).as('recycleNodePool');
            ui_1.ui.dialog
                .findByTitle('Recycle node pool?')
                .should('be.visible')
                .within(function () {
                cy.findByText('Delete and recreate all nodes in this node pool.', {
                    exact: false,
                }).should('be.visible');
                recycleWarningSubstrings.forEach(function (warning) {
                    cy.findByText(warning, { exact: false }).should('be.visible');
                });
                ui_1.ui.button
                    .findByTitle('Recycle Pool Nodes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@recycleNodePool');
            ui_1.ui.toast.assertMessage("Recycled all nodes in node pool ".concat(mockNodePool.id));
            ui_1.ui.button
                .findByTitle('Recycle All Nodes')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockRecycleAllNodes)(mockCluster.id).as('recycleAllNodes');
            ui_1.ui.dialog
                .findByTitle('Recycle all nodes in cluster?')
                .should('be.visible')
                .within(function () {
                cy.findByText('Delete and recreate all nodes in this cluster.', {
                    exact: false,
                }).should('be.visible');
                recycleWarningSubstrings.forEach(function (warning) {
                    cy.findByText(warning, { exact: false }).should('be.visible');
                });
                ui_1.ui.button
                    .findByTitle('Recycle All Cluster Nodes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@recycleAllNodes');
            ui_1.ui.toast.assertMessage('All cluster nodes queued for recycling');
        });
        /*
         * - Confirms UI flow when enabling and disabling node pool autoscaling using mocked API responses.
         * - Confirms that errors are shown when attempting to autoscale using invalid values.
         * - Confirms that UI updates to reflect node pool autoscale state.
         */
        it('can toggle autoscaling', function () {
            var autoscaleMin = 3;
            var autoscaleMax = 10;
            var minWarning = 'Minimum must be between 1 and 99 nodes and cannot be greater than Maximum.';
            var maxWarning = 'Maximum must be between 1 and 100 nodes.';
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
            });
            var mockNodePool = factories_1.nodePoolFactory.build({
                count: 1,
                type: 'g6-standard-1',
                nodes: factories_1.kubeLinodeFactory.buildList(1),
            });
            var mockNodePoolAutoscale = __assign(__assign({}, mockNodePool), { autoscaler: {
                    enabled: true,
                    min: autoscaleMin,
                    max: autoscaleMax,
                } });
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool]).as('getNodePools');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getCluster', '@getNodePools', '@getVersions']);
            // Click "Autoscale Pool", enable autoscaling, and set min and max values.
            (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePoolAutoscale).as('toggleAutoscale');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolAutoscale]).as('getNodePools');
            ui_1.ui.button
                .findByTitle('Autoscale Pool')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle('Autoscale Pool')
                .should('be.visible')
                .within(function () {
                cy.findByText('Autoscale').should('be.visible').click();
                cy.findByLabelText('Min').should('be.visible').click();
                cy.focused().clear();
                cy.focused().type("".concat(autoscaleMin));
                cy.findByText(minWarning).should('be.visible');
                cy.findByLabelText('Max').should('be.visible').click();
                cy.focused().clear();
                cy.focused().type('101');
                cy.findByText(minWarning).should('not.exist');
                cy.findByText(maxWarning).should('be.visible');
                cy.findByLabelText('Max').should('be.visible').click();
                cy.focused().clear();
                cy.focused().type("".concat(autoscaleMax));
                cy.findByText(minWarning).should('not.exist');
                cy.findByText(maxWarning).should('not.exist');
                ui_1.ui.button.findByTitle('Save Changes').should('be.visible').click();
            });
            // Wait for API response and confirm that UI updates to reflect autoscale.
            cy.wait(['@toggleAutoscale', '@getNodePools']);
            ui_1.ui.toast.assertMessage("Autoscaling updated for Node Pool ".concat(mockNodePool.id, "."));
            cy.findByText("(Min ".concat(autoscaleMin, " / Max ").concat(autoscaleMax, ")")).should('be.visible');
            // Click "Autoscale Pool" again and disable autoscaling.
            (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePool).as('toggleAutoscale');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool]).as('getNodePools');
            ui_1.ui.button
                .findByTitle('Autoscale Pool')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle('Autoscale Pool')
                .should('be.visible')
                .within(function () {
                cy.findByText('Autoscale').should('be.visible').click();
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Wait for API response and confirm that UI updates to reflect no autoscale.
            cy.wait(['@toggleAutoscale', '@getNodePools']);
            ui_1.ui.toast.assertMessage("Autoscaling updated for Node Pool ".concat(mockNodePool.id, "."));
            cy.findByText("(Min ".concat(autoscaleMin, " / Max ").concat(autoscaleMax, ")")).should('not.exist');
        });
        /*
         * - Confirms node pool resize UI flow using mocked API responses.
         * - Confirms that pool size can be increased and decreased.
         * - Confirms that user is warned when decreasing node pool size.
         * - Confirms that UI updates to reflect new node pool size.
         */
        it('can resize pools', function () {
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
            });
            var mockNodePoolResized = factories_1.nodePoolFactory.build({
                count: 3,
                type: 'g6-standard-1',
                nodes: factories_1.kubeLinodeFactory.buildList(3),
            });
            var mockNodePoolInitial = __assign(__assign({}, mockNodePoolResized), { count: 1, nodes: [mockNodePoolResized.nodes[0]] });
            var mockLinodes = mockNodePoolResized.nodes.map(function (node) {
                var _a;
                return factories_1.linodeFactory.build({
                    id: (_a = node.instance_id) !== null && _a !== void 0 ? _a : undefined,
                    ipv4: [(0, random_1.randomIp)()],
                });
            });
            var mockNodePoolDrawerTitle = 'Resize Pool: Linode 2 GB Plan';
            var decreaseSizeWarning = 'Resizing to fewer nodes will delete random nodes from the pool.';
            var nodeSizeRecommendation = 'We recommend a minimum of 3 nodes in each Node Pool to avoid downtime during upgrades and maintenance.';
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolInitial]).as('getNodePools');
            (0, linodes_1.mockGetLinodes)(mockLinodes).as('getLinodes');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getCluster', '@getNodePools', '@getLinodes', '@getVersions']);
            // Confirm that nodes are listed with correct details.
            mockNodePoolInitial.nodes.forEach(function (node) {
                cy.get("tr[data-qa-node-row=\"".concat(node.id, "\"]"))
                    .should('be.visible')
                    .within(function () {
                    var nodeLinode = mockLinodes.find(function (linode) { return linode.id === node.instance_id; });
                    if (nodeLinode) {
                        cy.findByText(nodeLinode.label).should('be.visible');
                        cy.findByText(nodeLinode.ipv4[0]).should('be.visible');
                        ui_1.ui.button
                            .findByTitle('Recycle')
                            .should('be.visible')
                            .should('be.enabled');
                    }
                });
            });
            // Click "Resize Pool" and increase size to 3 nodes.
            ui_1.ui.button
                .findByTitle('Resize Pool')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePoolResized).as('resizeNodePool');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolResized]).as('getNodePools');
            ui_1.ui.drawer
                .findByTitle(mockNodePoolDrawerTitle)
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.disabled');
                cy.findByText('Current price: $12/month (1 node at $12/month each)').should('be.visible');
                cy.findByText('Resized price: $12/month (1 node at $12/month each)').should('be.visible');
                cy.findByLabelText('Add 1')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.focused().click();
                cy.findByLabelText('Edit Quantity').should('have.value', '3');
                cy.findByText('Resized price: $36/month (3 nodes at $12/month each)').should('be.visible');
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@resizeNodePool', '@getNodePools']);
            // Confirm that new nodes are listed with correct info.
            mockLinodes.forEach(function (mockLinode) {
                cy.findByText(mockLinode.label)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.findByText(mockLinode.ipv4[0]).should('be.visible');
                });
            });
            // Click "Resize Pool" and decrease size back to 1 node.
            ui_1.ui.button
                .findByTitle('Resize Pool')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePoolInitial).as('resizeNodePool');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolInitial]).as('getNodePools');
            ui_1.ui.drawer
                .findByTitle(mockNodePoolDrawerTitle)
                .should('be.visible')
                .within(function () {
                cy.findByLabelText('Subtract 1')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.focused().click();
                cy.findByText(decreaseSizeWarning).should('be.visible');
                cy.findByText(nodeSizeRecommendation).should('be.visible');
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@resizeNodePool', '@getNodePools']);
            cy.get('[data-qa-node-row]').should('have.length', 1);
        });
        /*
         * - Confirms kubeconfig reset UI flow using mocked API responses.
         * - Confirms that user is warned of repercussions before resetting config.
         * - Confirms that toast appears confirming kubeconfig has reset.
         */
        it('can reset kubeconfig', function () {
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
            });
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockResetKubeconfig)(mockCluster.id).as('resetKubeconfig');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            var resetWarnings = [
                'This will delete and regenerate the cluster’s Kubeconfig file',
                'You will no longer be able to access this cluster via your previous Kubeconfig file',
                'This action cannot be undone',
            ];
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getCluster', '@getNodePools', '@getVersions']);
            // Click "Reset" button, proceed through confirmation dialog.
            cy.findByText('Reset').should('be.visible').click({ force: true });
            ui_1.ui.dialog
                .findByTitle('Reset Cluster Kubeconfig?')
                .should('be.visible')
                .within(function () {
                resetWarnings.forEach(function (warning) {
                    cy.findByText(warning, { exact: false }).should('be.visible');
                });
                ui_1.ui.button
                    .findByTitle('Reset Kubeconfig')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Wait for API response and assert toast message appears.
            cy.wait('@resetKubeconfig');
            ui_1.ui.toast.assertMessage('Successfully reset Kubeconfig');
        });
        /*
         * - Confirms UI flow when adding and deleting node pools.
         * - Confirms that user cannot delete a node pool when there is only 1 pool.
         * - Confirms that details page updates to reflect change when pools are added or deleted.
         */
        it('can add and delete node pools', function () {
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
            });
            var mockNodePool = factories_1.nodePoolFactory.build({
                type: 'g6-dedicated-4',
            });
            var mockNewNodePool = factories_1.nodePoolFactory.build({
                type: 'g6-dedicated-2',
            });
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool]).as('getNodePools');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockAddNodePool)(mockCluster.id, mockNewNodePool).as('addNodePool');
            (0, lke_2.mockDeleteNodePool)(mockCluster.id, mockNewNodePool.id).as('deleteNodePool');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getCluster', '@getNodePools', '@getVersions']);
            // Assert that initial node pool is shown on the page.
            cy.findByText('Dedicated 8 GB', { selector: 'h2' }).should('be.visible');
            // "Delete Pool" button should be disabled when only 1 node pool exists.
            ui_1.ui.button
                .findByTitle('Delete Pool')
                .should('be.visible')
                .should('be.disabled');
            // Add a new node pool, select plan, submit form in drawer.
            ui_1.ui.button
                .findByTitle('Add a Node Pool')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool, mockNewNodePool]).as('getNodePools');
            ui_1.ui.drawer
                .findByTitle("Add a Node Pool: ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                cy.findByText('Dedicated 4 GB')
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.findByLabelText('Add 1').should('be.visible').click();
                });
                ui_1.ui.button
                    .findByTitle('Add pool')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Wait for API responses and confirm that both node pools are shown.
            cy.wait(['@addNodePool', '@getNodePools']);
            cy.findByText('Dedicated 8 GB', { selector: 'h2' }).should('be.visible');
            cy.findByText('Dedicated 4 GB', { selector: 'h2' }).should('be.visible');
            // Delete the newly added node pool.
            cy.get("[data-qa-node-pool-id=\"".concat(mockNewNodePool.id, "\"]"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Delete Pool')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool]).as('getNodePools');
            ui_1.ui.dialog
                .findByTitle('Delete Node Pool?')
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Delete')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm node pool is deleted, original node pool still exists, and
            // delete pool button is once again disabled.
            cy.wait(['@deleteNodePool', '@getNodePools']);
            cy.findByText('Dedicated 8 GB', { selector: 'h2' }).should('be.visible');
            cy.findByText('Dedicated 4 GB', { selector: 'h2' }).should('not.exist');
            ui_1.ui.button
                .findByTitle('Delete Pool')
                .should('be.visible')
                .should('be.disabled');
        });
        /*
         * - Confirms LKE summary page updates to reflect new cluster name.
         */
        it('can rename cluster', function () {
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
            });
            var mockNewCluster = factories_1.kubernetesClusterFactory.build({
                label: 'newClusterName',
            });
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
            (0, lke_2.mockUpdateCluster)(mockCluster.id, mockNewCluster).as('updateCluster');
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
            cy.wait(['@getCluster', '@getNodePools', '@getVersions']);
            // LKE clusters can be renamed by clicking on the cluster's name in the breadcrumbs towards the top of the page.
            cy.get('[data-testid="editable-text"] > [data-testid="button"]').click();
            cy.get('[data-qa-edit-field]').within(function () {
                cy.findByTestId('textfield-input')
                    .should('be.visible')
                    .should('have.value', mockCluster.label)
                    .clear();
                cy.focused().type("".concat(mockNewCluster.label, "{enter}"));
            });
            cy.wait('@updateCluster');
            cy.findAllByText(mockNewCluster.label).should('be.visible');
            cy.findAllByText(mockCluster.label).should('not.exist');
        });
        /*
         * - Confirms error message shows when the API request fails.
         */
        it('can handle API errors when renaming cluster', function () {
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
            });
            var mockErrorCluster = factories_1.kubernetesClusterFactory.build({
                label: 'errorClusterName',
            });
            var mockErrorMessage = 'API request fails';
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
            (0, lke_2.mockUpdateClusterError)(mockCluster.id, mockErrorMessage).as('updateClusterError');
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
            cy.wait(['@getCluster', '@getNodePools', '@getVersions']);
            // LKE cluster can be renamed by clicking on the cluster's name in the breadcrumbs towards the top of the page.
            cy.get('[data-testid="editable-text"] > [data-testid="button"]').click();
            cy.get('[data-qa-edit-field]').within(function () {
                cy.findByTestId('textfield-input')
                    .should('be.visible')
                    .should('have.value', mockCluster.label)
                    .clear();
                cy.focused().type("".concat(mockErrorCluster.label, "{enter}"));
            });
            // Error message shows when API request fails.
            cy.wait('@updateClusterError');
            cy.findAllByText(mockErrorMessage).should('be.visible');
        });
    });
    it('can add and delete node pool tags', function () {
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: lke_1.latestKubernetesVersion,
        });
        var mockType = factories_1.linodeTypeFactory.build();
        var mockNodePoolInstances = (0, arrays_1.buildArray)(3, function () {
            return factories_1.linodeFactory.build({ label: (0, random_1.randomLabel)() });
        });
        var mockNodes = mockNodePoolInstances.map(function (linode, i) {
            return factories_1.kubeLinodeFactory.build({
                instance_id: linode.id,
                status: 'ready',
            });
        });
        var mockNodePoolNoTags = factories_1.nodePoolFactory.build({
            id: 1,
            type: mockType.id,
            nodes: mockNodes,
        });
        var mockNodePoolWithTags = __assign(__assign({}, mockNodePoolNoTags), { tags: ['test-tag'] });
        (0, linodes_1.mockGetLinodes)(mockNodePoolInstances);
        (0, linodes_1.mockGetLinodeType)(factories_1.linodeTypeFactory.build({ id: mockType.id })).as('getType');
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolNoTags]).as('getNodePoolsNoTags');
        (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
        (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, { acl: { enabled: false } }).as('getControlPlaneAcl');
        (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePoolWithTags).as('addTag');
        (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
        (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
        cy.wait([
            '@getCluster',
            '@getNodePoolsNoTags',
            '@getVersions',
            '@getType',
            '@getControlPlaneAcl',
        ]);
        // Confirm that Linode instance info has finished loading before attempting
        // to interact with the tag button.
        mockNodePoolInstances.forEach(function (linode) {
            cy.findByText(linode.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('Running').should('be.visible');
            });
        });
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePoolNoTags.id, "\"]")).within(function () {
            ui_1.ui.button.findByTitle('Add a tag').should('be.visible').click();
            cy.findByLabelText('Create or Select a Tag')
                .should('be.visible')
                .type("".concat(mockNodePoolWithTags.tags[0]));
            ui_1.ui.autocompletePopper
                .findByTitle("Create \"".concat(mockNodePoolWithTags.tags[0], "\""))
                .scrollIntoView()
                .should('be.visible')
                .click();
        });
        (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolWithTags]).as('getNodePoolsWithTags');
        cy.wait(['@addTag', '@getNodePoolsWithTags']);
        (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePoolNoTags).as('deleteTag');
        (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolNoTags]).as('getNodePoolsNoTags');
        // Delete the newly added node pool tag.
        cy.get("[data-qa-tag=\"".concat(mockNodePoolWithTags.tags[0], "\"]"))
            .should('be.visible')
            .within(function () {
            cy.get('[data-qa-delete-tag="true"]').should('be.visible').click();
        });
        cy.wait(['@deleteTag', '@getNodePoolsNoTags']);
        cy.get("[data-qa-tag=\"".concat(mockNodePoolWithTags.tags[0], "\"]")).should('not.exist');
    });
    /*
     * - Confirms Labels and Taints button exists for a node pool.
     * - Confirms Labels and Taints drawer displays the expected Labels and Taints.
     * - Confirms Labels and Taints can be deleted from a node pool.
     * - Confirms that Labels and Taints can be added to a node pool.
     * - Confirms validation and errors are handled gracefully.
     */
    describe('confirms labels and taints functionality for a node pool', function () {
        var _a;
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: lke_1.latestKubernetesVersion,
        });
        var mockType = factories_1.linodeTypeFactory.build({ label: 'Linode 2 GB' });
        var mockNodePoolInstances = (0, arrays_1.buildArray)(1, function () {
            return factories_1.linodeFactory.build({ label: (0, random_1.randomLabel)() });
        });
        var mockNodes = mockNodePoolInstances.map(function (linode, i) {
            return factories_1.kubeLinodeFactory.build({
                instance_id: linode.id,
                status: 'ready',
            });
        });
        var mockNodePoolInitial = factories_1.nodePoolFactory.build({
            id: 1,
            type: mockType.id,
            nodes: mockNodes,
            labels: (_a = {},
                _a['example.com/my-app'] = 'teams',
                _a),
            taints: [
                {
                    effect: 'NoSchedule',
                    key: 'example.com/my-app',
                    value: 'teamA',
                },
            ],
        });
        var mockDrawerTitle = 'Labels and Taints: Linode 2 GB Plan';
        beforeEach(function () {
            (0, linodes_1.mockGetLinodes)(mockNodePoolInstances);
            (0, linodes_1.mockGetLinodeType)(mockType).as('getType');
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolInitial]).as('getNodePools');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, { acl: { enabled: false } }).as('getControlPlaneAcl');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
        });
        it('can delete labels and taints', function () {
            var mockNodePoolUpdated = factories_1.nodePoolFactory.build({
                id: 1,
                type: mockType.id,
                nodes: mockNodes,
                taints: [],
                labels: {},
            });
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait([
                '@getCluster',
                '@getNodePools',
                '@getVersions',
                '@getType',
                '@getControlPlaneAcl',
            ]);
            (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePoolUpdated).as('updateNodePool');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolUpdated]).as('getNodePoolsUpdated');
            // Click "Labels and Taints" button and confirm drawer contents.
            ui_1.ui.button
                .findByTitle('Labels and Taints')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle(mockDrawerTitle)
                .should('be.visible')
                .within(function () {
                // Confirm drawer opens with the correct CTAs.
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.disabled');
                ui_1.ui.button
                    .findByTitle('Cancel')
                    .should('be.visible')
                    .should('be.enabled');
                // Confirm that the Labels table exists and is populated with the correct details.
                Object.entries(mockNodePoolInitial.labels).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    cy.get("tr[data-qa-label-row=\"".concat(key, "\"]"))
                        .should('be.visible')
                        .within(function () {
                        cy.findByText("".concat(key, ": ").concat(value)).should('be.visible');
                        // Confirm delete button exists, then click it.
                        ui_1.ui.button
                            .findByAttribute('aria-label', "Remove ".concat(key, ": ").concat(value))
                            .should('be.visible')
                            .should('be.enabled')
                            .click();
                        // Confirm the label is no longer visible.
                        cy.findByText("".concat(key, ": ").concat(value)).should('not.exist');
                    });
                });
                // Confirm that the Taints table exists and is populated with the correct details.
                mockNodePoolInitial.taints.forEach(function (taint) {
                    cy.get("tr[data-qa-taint-row=\"".concat(taint.key, "\"]"))
                        .should('be.visible')
                        .within(function () {
                        cy.findByText("".concat(taint.key, ": ").concat(taint.value)).should('be.visible');
                        cy.findByText(taint.effect).should('be.visible');
                        // Confirm delete button exists, then click it.
                        ui_1.ui.button
                            .findByAttribute('aria-label', "Remove ".concat(taint.key, ": ").concat(taint.value))
                            .should('be.visible')
                            .should('be.enabled')
                            .click();
                        // Confirm the taint is no longer visible.
                        cy.findByText("".concat(taint.key, ": ").concat(taint.value)).should('not.exist');
                    });
                });
                // Confirm empty state text displays for both empty tables.
                cy.findByText('No labels').should('be.visible');
                cy.findByText('No taints').should('be.visible');
                // Confirm form can be submitted.
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm request has the correct data.
            cy.wait('@updateNodePool').then(function (xhr) {
                var _a;
                var data = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body;
                if (data) {
                    var actualLabels = data.labels;
                    var actualTaints = data.taints;
                    expect(actualLabels).to.deep.equal(mockNodePoolUpdated.labels);
                    expect(actualTaints).to.deep.equal(mockNodePoolUpdated.taints);
                }
            });
            cy.wait('@getNodePoolsUpdated');
            // Confirm drawer closes.
            cy.findByText(mockDrawerTitle).should('not.exist');
        });
        it('can add labels and taints', function () {
            var mockNewSimpleLabel = 'my_label.-key: my_label.-value';
            var mockNewDNSLabel = 'my_label-key.io/app: my_label.-value';
            var mockNewTaint = {
                key: 'my_taint.-key',
                value: 'my_taint.-value',
                effect: 'NoSchedule',
            };
            var mockNewDNSTaint = {
                key: 'my_taint-key.io/app',
                value: 'my_taint.-value',
                effect: 'NoSchedule',
            };
            var mockNodePoolUpdated = factories_1.nodePoolFactory.build({
                id: 1,
                type: mockType.id,
                nodes: mockNodes,
                taints: [mockNewTaint, mockNewDNSTaint],
                labels: {
                    'my_label-key': 'my_label.-value',
                    'my_label-key.io/app': 'my_label.-value',
                },
            });
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait([
                '@getCluster',
                '@getNodePools',
                '@getVersions',
                '@getType',
                '@getControlPlaneAcl',
            ]);
            (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePoolUpdated).as('updateNodePool');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolUpdated]).as('getNodePoolsUpdated');
            // Click "Labels and Taints" button and confirm drawer contents.
            ui_1.ui.button
                .findByTitle('Labels and Taints')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle(mockDrawerTitle)
                .should('be.visible')
                .within(function () {
                // Confirm drawer opens with the correct CTAs.
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.disabled');
                ui_1.ui.button
                    .findByTitle('Cancel')
                    .should('be.visible')
                    .should('be.enabled');
                // Add a label:
                ui_1.ui.button
                    .findByTitle('Add Label')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // Confirm form button is disabled and label form displays with the correct CTAs.
                ui_1.ui.button
                    .findByTitle('Add Label')
                    .should('be.visible')
                    .should('be.disabled');
                // Confirm labels with simple keys and DNS subdomain keys can be added.
                [mockNewSimpleLabel, mockNewDNSLabel].forEach(function (newLabel, index) {
                    // Confirm form adds a valid new label.
                    cy.findByLabelText('Label').click();
                    cy.focused().type(newLabel);
                    ui_1.ui.button.findByTitle('Add').click();
                    // Confirm add form closes and Add Label button is re-enabled.
                    cy.findByLabelText('Label').should('not.exist');
                    cy.findByLabelText('Add').should('not.exist');
                    ui_1.ui.button.findByTitle('Add Label').should('be.enabled');
                    // Confirm new label is visible in table.
                    cy.get("tr[data-qa-label-row=\"".concat(newLabel.split(':')[0], "\"]"))
                        .should('be.visible')
                        .within(function () {
                        cy.findByText(newLabel).should('be.visible');
                    });
                    if (index === 0) {
                        ui_1.ui.button.findByTitle('Add Label').click();
                    }
                });
                // Add a taint:
                ui_1.ui.button
                    .findByTitle('Add Taint')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // Confirm form button is disabled and label form displays with the correct CTAs.
                ui_1.ui.button.findByTitle('Add Taint').should('be.disabled');
                // Confirm taints with simple keys and DNS subdomain keys can be added.
                [mockNewTaint, mockNewDNSTaint].forEach(function (newTaint, index) {
                    // Confirm form adds a valid new taint.
                    cy.findByLabelText('Taint').click();
                    cy.focused().type("".concat(newTaint.key, ": ").concat(newTaint.value));
                    ui_1.ui.autocomplete.findByLabel('Effect').click();
                    ui_1.ui.autocompletePopper
                        .findByTitle(newTaint.effect)
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                    ui_1.ui.button.findByTitle('Add').click();
                    // Confirm add form closes and Add Taint button is re-enabled.
                    cy.findByLabelText('Taint').should('not.exist');
                    cy.findByLabelText('Add').should('not.exist');
                    ui_1.ui.button.findByTitle('Add Taint').should('be.enabled');
                    // Confirm new taint is visible in table.
                    cy.get("tr[data-qa-taint-row=\"".concat(newTaint.key, "\"]"))
                        .should('be.visible')
                        .within(function () {
                        cy.findByText("".concat(newTaint.key, ": ").concat(newTaint.value)).should('be.visible');
                        cy.findByText(newTaint.effect).should('be.visible');
                    });
                    if (index === 0) {
                        ui_1.ui.button.findByTitle('Add Taint').click();
                    }
                });
                // Confirm form can be submitted.
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm request has the correct data.
            cy.wait('@updateNodePool').then(function (xhr) {
                var _a;
                var data = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body;
                if (data) {
                    var actualLabels = data.labels;
                    var actualTaints = data.taints;
                    console.log({ actualTaints: actualTaints }, { actualLabels: actualLabels });
                    expect(actualLabels).to.deep.equal(mockNodePoolUpdated.labels);
                    expect(actualTaints).to.deep.equal(mockNodePoolUpdated.taints);
                }
            });
            cy.wait('@getNodePoolsUpdated');
            // Confirm drawer closes.
            cy.findByText(mockDrawerTitle).should('not.exist');
        });
        it('can handle validation and errors for labels and taints', function () {
            var invalidDNSSubdomainLabel = "my-app/".concat((0, random_2.randomString)(129));
            var invalidLabels = [
                'label with spaces',
                'key-and-no-value',
                (0, random_2.randomString)(64),
                invalidDNSSubdomainLabel,
                'valid-key: invalid value',
                '%invalid-character: value',
                'example.com/myapp: %invalid-character',
                'kubernetes.io: value',
                'linode.com: value',
            ];
            var invalidTaintKeys = [
                (0, random_2.randomString)(254),
                'key with spaces',
                '!invalid-characters',
            ];
            var invalidTaintValues = [
                "key:".concat((0, random_2.randomString)(64)),
                'key: kubernetes.io',
                'key: linode.com',
                'key:value with spaces',
            ];
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait([
                '@getCluster',
                '@getNodePools',
                '@getVersions',
                '@getType',
                '@getControlPlaneAcl',
            ]);
            var mockErrorMessage = 'API Error';
            (0, lke_2.mockUpdateNodePoolError)(mockCluster.id, mockNodePoolInitial, mockErrorMessage).as('updateNodePoolError');
            // Click "Labels and Taints" button and confirm drawer contents.
            ui_1.ui.button
                .findByTitle('Labels and Taints')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle(mockDrawerTitle)
                .should('be.visible')
                .within(function () {
                ui_1.ui.button.findByTitle('Add Label').click();
                // Try to submit without adding a label.
                ui_1.ui.button.findByTitle('Add').click();
                // Confirm error validation for invalid label input.
                cy.findByText('Labels must be valid key-value pairs.').should('be.visible');
                invalidLabels.forEach(function (invalidLabel) {
                    cy.findByLabelText('Label').click();
                    cy.focused().clear();
                    cy.focused().type(invalidLabel);
                    // Try to submit with invalid label.
                    ui_1.ui.button.findByTitle('Add').click();
                    // Confirm error validation for invalid label input.
                    cy.findByText('Labels must be valid key-value pairs.').should('be.visible');
                });
                // Submit a valid label to enable the 'Save Changes' button.
                cy.findByLabelText('Label').click();
                cy.focused().clear();
                cy.focused().type('mockKey: mockValue');
                ui_1.ui.button.findByTitle('Add').click();
                ui_1.ui.button.findByTitle('Add Taint').click();
                // Try to submit without adding a taint.
                ui_1.ui.button.findByTitle('Add').click();
                // Confirm error validation for invalid taint input.
                cy.findByText('Key is required.').should('be.visible');
                invalidTaintKeys.forEach(function (invalidTaintKey, index) {
                    cy.findByLabelText('Taint').click();
                    cy.focused().clear();
                    cy.focused().type(invalidTaintKey);
                    // Try to submit taint with invalid key.
                    ui_1.ui.button.findByTitle('Add').click();
                    if (index === 0) {
                        cy.findByText('Key must be between 1 and 253 characters.').should('be.visible');
                    }
                    else {
                        cy.findByText(/Key must start with a letter or number/).should('be.visible');
                    }
                });
                invalidTaintValues.forEach(function (invalidTaintValue, index) {
                    cy.findByLabelText('Taint').click();
                    cy.focused().clear();
                    cy.focused().type(invalidTaintValue);
                    // Try to submit taint with invalid value.
                    ui_1.ui.button.findByTitle('Add').click();
                    if (index === 0) {
                        cy.findByText('Value must be between 0 and 63 characters.').should('be.visible');
                    }
                    else if (index === invalidTaintValues.length - 1) {
                        cy.findByText(/Value must start with a letter or number/).should('be.visible');
                    }
                    else {
                        cy.findByText('Value cannot be "kubernetes.io" or "linode.com".').should('be.visible');
                    }
                });
                ui_1.ui.button.findByAttribute('data-testid', 'cancel-taint').click();
                // Try to submit form, but mock an API error.
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm error message shows when API request fails.
            cy.wait('@updateNodePoolError');
            cy.findAllByText(mockErrorMessage).should('be.visible');
        });
    });
    it('does not collapse the accordion when an action button is clicked in the accordion header', function () {
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: lke_1.latestKubernetesVersion,
        });
        var mockSingleNodePool = mockNodePools[0];
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockSingleNodePool]).as('getNodePools');
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
        cy.wait(['@getCluster', '@getNodePools']);
        cy.get("[data-qa-node-pool-id=\"".concat(mockSingleNodePool.id, "\"]")).within(function () {
            // Accordion should be expanded by default
            cy.get("[data-qa-panel-summary]").should('have.attr', 'aria-expanded', 'true');
            // Click on a disabled button
            cy.get('[data-testid="node-pool-actions"]')
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Delete Pool')
                    .should('be.visible')
                    .should('be.disabled')
                    .click();
            });
            // Check that the accordion is still expanded
            cy.get("[data-qa-panel-summary]").should('have.attr', 'aria-expanded', 'true');
            // Click on an action button
            cy.get('[data-testid="node-pool-actions"]')
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Autoscale Pool')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
        });
        // Exit dialog
        ui_1.ui.dialog
            .findByTitle('Autoscale Pool')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.get("[data-qa-node-pool-id=\"".concat(mockSingleNodePool.id, "\"]")).within(function () {
            // Check that the accordion is still expanded
            cy.get("[data-qa-panel-summary]").should('have.attr', 'aria-expanded', 'true');
            // Accordion should close on non-action button clicks
            cy.get('[data-qa-panel-subheading]').click();
            cy.get("[data-qa-panel-summary]").should('have.attr', 'aria-expanded', 'false');
        });
    });
    it('sets default expanded node pools and has collapse/expand all functionality', function () {
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: lke_1.latestKubernetesVersion,
        });
        var mockNodePools = [
            factories_1.nodePoolFactory.build({
                nodes: factories_1.kubeLinodeFactory.buildList(10),
                count: 10,
            }),
            factories_1.nodePoolFactory.build({
                nodes: factories_1.kubeLinodeFactory.buildList(5),
                count: 5,
            }),
            factories_1.nodePoolFactory.build({ nodes: [factories_1.kubeLinodeFactory.build()] }),
        ];
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
        cy.wait(['@getCluster', '@getNodePools']);
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[0].id, "\"]")).within(function () {
            // Accordion should be collapsed by default since there are more than 9 nodes
            cy.get("[data-qa-panel-summary]").should('have.attr', 'aria-expanded', 'false');
        });
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[1].id, "\"]")).within(function () {
            // Accordion should be expanded by default since there are not more than 9 nodes
            cy.get("[data-qa-panel-summary]").should('have.attr', 'aria-expanded', 'true');
        });
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[2].id, "\"]")).within(function () {
            // Accordion should be expanded by default since there are not more than 9 nodes
            cy.get("[data-qa-panel-summary]").should('have.attr', 'aria-expanded', 'true');
        });
        // Collapse all pools
        ui_1.ui.button
            .findByTitle('Collapse All Pools')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.get("[data-qa-node-pool-id]").each(function ($pool) {
            // Accordion should be collapsed
            cy.wrap($pool).within(function () {
                cy.get("[data-qa-panel-summary]").should('have.attr', 'aria-expanded', 'false');
            });
        });
        // Expand all pools
        ui_1.ui.button
            .findByTitle('Expand All Pools')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.get("[data-qa-node-pool-id]").each(function ($pool) {
            // Accordion should be expanded
            cy.wrap($pool).within(function () {
                cy.get("[data-qa-panel-summary]").should('have.attr', 'aria-expanded', 'true');
            });
        });
    });
    it('filters the node tables based on selected status filter', function () {
        var _a, _b, _c, _d, _e, _f;
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            k8s_version: lke_1.latestKubernetesVersion,
            created: luxon_1.DateTime.local().toISO(),
            tier: 'enterprise',
        });
        var mockNodePools = [
            factories_1.nodePoolFactory.build({
                count: 4,
                nodes: __spreadArray(__spreadArray([], factories_1.kubeLinodeFactory.buildList(3), true), [
                    factories_1.kubeLinodeFactory.build({ status: 'not_ready' }),
                ], false),
            }),
            factories_1.nodePoolFactory.build({
                count: 2,
                nodes: factories_1.kubeLinodeFactory.buildList(2),
            }),
        ];
        var mockLinodes = [
            factories_1.linodeFactory.build({
                id: (_a = mockNodePools[0].nodes[0].instance_id) !== null && _a !== void 0 ? _a : undefined,
            }),
            factories_1.linodeFactory.build({
                id: (_b = mockNodePools[0].nodes[1].instance_id) !== null && _b !== void 0 ? _b : undefined,
            }),
            factories_1.linodeFactory.build({
                id: (_c = mockNodePools[0].nodes[2].instance_id) !== null && _c !== void 0 ? _c : undefined,
                status: 'offline',
            }),
            factories_1.linodeFactory.build({
                id: (_d = mockNodePools[0].nodes[3].instance_id) !== null && _d !== void 0 ? _d : undefined,
                status: 'provisioning',
            }),
            factories_1.linodeFactory.build({
                id: (_e = mockNodePools[1].nodes[0].instance_id) !== null && _e !== void 0 ? _e : undefined,
            }),
            factories_1.linodeFactory.build({
                id: (_f = mockNodePools[1].nodes[1].instance_id) !== null && _f !== void 0 ? _f : undefined,
                status: 'offline',
            }),
        ];
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
        (0, linodes_1.mockGetLinodes)(mockLinodes).as('getLinodes');
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
        cy.wait(['@getCluster', '@getNodePools', '@getLinodes']);
        // Filter is initially set to Show All nodes
        cy.findByText('Nodes will appear once cluster provisioning is complete.').should('not.exist');
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[0].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 4);
        });
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[1].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 2);
        });
        // Filter by Running status
        ui_1.ui.autocomplete.findByLabel('Status').click();
        ui_1.ui.autocompletePopper.findByTitle('Running').should('be.visible').click();
        // Only Running nodes should be displayed
        cy.findByText('Nodes will appear once cluster provisioning is complete.').should('not.exist');
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[0].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 2);
        });
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[1].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 1);
        });
        // Filter by Offline status
        ui_1.ui.autocomplete.findByLabel('Status').click();
        ui_1.ui.autocompletePopper.findByTitle('Offline').should('be.visible').click();
        // Only Offline nodes should be displayed
        cy.findByText('Nodes will appear once cluster provisioning is complete.').should('not.exist');
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[0].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 1);
        });
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[1].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 1);
        });
        // Filter by Provisioning status
        ui_1.ui.autocomplete.findByLabel('Status').click();
        ui_1.ui.autocompletePopper
            .findByTitle('Provisioning')
            .should('be.visible')
            .click();
        // Only Provisioning nodes should be displayed
        cy.findByText('Nodes will appear once cluster provisioning is complete.').should('not.exist');
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[0].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 1);
        });
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[1].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 0);
        });
        // Filter by Show All status
        ui_1.ui.autocomplete.findByLabel('Status').click();
        ui_1.ui.autocompletePopper.findByTitle('Show All').should('be.visible').click();
        // All nodes are displayed
        cy.findByText('Nodes will appear once cluster provisioning is complete.').should('not.exist');
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[0].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 4);
        });
        cy.get("[data-qa-node-pool-id=\"".concat(mockNodePools[1].id, "\"]")).within(function () {
            cy.get('[data-qa-node-row]').should('have.length', 2);
        });
    });
    describe('LKE cluster updates for DC-specific prices', function () {
        /*
         * - Confirms node pool resize UI flow using mocked API responses.
         * - Confirms that pool size can be increased and decreased.
         * - Confirms that drawer reflects prices in regions with DC-specific pricing.
         * - Confirms that details page updates total cluster price with DC-specific pricing.
         */
        it('can resize pools with DC-specific prices', function () {
            var dcSpecificPricingRegion = (0, regions_1.getRegionById)('us-east');
            var mockPlanType = (0, extendType_1.extendType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[0]);
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
                region: dcSpecificPricingRegion.id,
                control_plane: {
                    high_availability: false,
                },
            });
            var mockNodePoolResized = factories_1.nodePoolFactory.build({
                count: 3,
                type: mockPlanType.id,
                nodes: factories_1.kubeLinodeFactory.buildList(3),
            });
            var mockNodePoolInitial = __assign(__assign({}, mockNodePoolResized), { count: 1, nodes: [mockNodePoolResized.nodes[0]] });
            var mockLinodes = mockNodePoolResized.nodes.map(function (node) {
                var _a;
                return factories_1.linodeFactory.build({
                    id: (_a = node.instance_id) !== null && _a !== void 0 ? _a : undefined,
                    ipv4: [(0, random_1.randomIp)()],
                    region: dcSpecificPricingRegion.id,
                    type: mockPlanType.id,
                });
            });
            var mockNodePoolDrawerTitle = "Resize Pool: ".concat(mockPlanType.formattedLabel, " Plan");
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolInitial]).as('getNodePools');
            (0, linodes_1.mockGetLinodes)(mockLinodes).as('getLinodes');
            (0, linodes_1.mockGetLinodeType)(mockPlanType).as('getLinodeType');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait([
                '@getCluster',
                '@getNodePools',
                '@getLinodes',
                '@getVersions',
                '@getLinodeType',
            ]);
            // Confirm that nodes are visible.
            mockNodePoolInitial.nodes.forEach(function (node) {
                cy.get("tr[data-qa-node-row=\"".concat(node.id, "\"]"))
                    .should('be.visible')
                    .within(function () {
                    var nodeLinode = mockLinodes.find(function (linode) { return linode.id === node.instance_id; });
                    if (nodeLinode) {
                        cy.findByText(nodeLinode.label).should('be.visible');
                    }
                });
            });
            // Confirm total price is listed in Kube Specs.
            cy.findByText('$14.40/month').should('be.visible');
            // Click "Resize Pool" and increase size to 3 nodes.
            ui_1.ui.button
                .findByTitle('Resize Pool')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePoolResized).as('resizeNodePool');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolResized]).as('getNodePools');
            ui_1.ui.drawer
                .findByTitle(mockNodePoolDrawerTitle)
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.disabled');
                cy.findByText('Current price: $14.40/month (1 node at $14.40/month each)').should('be.visible');
                cy.findByText('Resized price: $14.40/month (1 node at $14.40/month each)').should('be.visible');
                cy.findByLabelText('Add 1')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.focused().click();
                cy.focused().click();
                cy.findByLabelText('Edit Quantity').should('have.value', '4');
                cy.findByText('Current price: $14.40/month (1 node at $14.40/month each)').should('be.visible');
                cy.findByText('Resized price: $57.60/month (4 nodes at $14.40/month each)').should('be.visible');
                cy.findByLabelText('Subtract 1')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.findByLabelText('Edit Quantity').should('have.value', '3');
                cy.findByText('Resized price: $43.20/month (3 nodes at $14.40/month each)').should('be.visible');
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@resizeNodePool', '@getNodePools']);
            // Confirm total price updates in Kube Specs.
            cy.findByText('$43.20/month').should('be.visible');
        });
        /*
         * - Confirms UI flow when adding node pools using mocked API responses.
         * - Confirms that drawer reflects prices in regions with DC-specific pricing.
         * - Confirms that details page updates total cluster price with DC-specific pricing.
         */
        it('can add node pools with DC-specific prices', function () {
            var dcSpecificPricingRegion = (0, regions_1.getRegionById)('us-east');
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
                region: dcSpecificPricingRegion.id,
                control_plane: {
                    high_availability: false,
                },
            });
            var mockPlanType = (0, extendType_1.extendType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[0]);
            var mockNewNodePool = factories_1.nodePoolFactory.build({
                count: 2,
                type: mockPlanType.id,
                nodes: factories_1.kubeLinodeFactory.buildList(2),
            });
            var mockNodePool = factories_1.nodePoolFactory.build({
                count: 1,
                type: mockPlanType.id,
                nodes: factories_1.kubeLinodeFactory.buildList(1),
            });
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool]).as('getNodePools');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockAddNodePool)(mockCluster.id, mockNewNodePool).as('addNodePool');
            (0, linodes_1.mockGetLinodeType)(mockPlanType).as('getLinodeType');
            (0, linodes_1.mockGetLinodeTypes)(dc_specific_pricing_1.dcPricingMockLinodeTypes);
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait([
                '@getCluster',
                '@getNodePools',
                '@getVersions',
                '@getLinodeType',
            ]);
            // Assert that initial node pool is shown on the page.
            cy.findByText(mockPlanType.formattedLabel, { selector: 'h2' }).should('be.visible');
            // Confirm total price is listed in Kube Specs.
            cy.findByText('$14.40/month').should('be.visible');
            // Add a new node pool, select plan, submit form in drawer.
            ui_1.ui.button
                .findByTitle('Add a Node Pool')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool, mockNewNodePool]).as('getNodePools');
            ui_1.ui.drawer
                .findByTitle("Add a Node Pool: ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                cy.findByText('Shared CPU')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.findByText(mockPlanType.formattedLabel)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    // Assert that DC-specific prices are displayed the plan table, then add a node pool with 2 linodes.
                    cy.findByText('$14.40').should('be.visible');
                    cy.findByText('$0.021').should('be.visible');
                    cy.findByLabelText('Add 1').should('be.visible').click();
                    cy.focused().click();
                });
                // Assert that DC-specific prices are displayed as helper text.
                cy.contains('This pool will add $28.80/month (2 nodes at $14.40/month) to this cluster.').should('be.visible');
                ui_1.ui.button
                    .findByTitle('Add pool')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Wait for API responses.
            cy.wait(['@addNodePool', '@getNodePools']);
            // Confirm total price updates in Kube Specs: $14.40/mo existing pool + $28.80/mo new pool.
            cy.findByText('$43.20/month').should('be.visible');
        });
        /*
         * - Confirms node pool resize UI flow using mocked API responses.
         * - Confirms that pool size can be changed.
         * - Confirms that drawer reflects $0 pricing.
         * - Confirms that details page still shows $0 pricing after resizing.
         */
        it('can resize pools with region prices of $0', function () {
            var dcSpecificPricingRegion = (0, regions_1.getRegionById)('us-southeast');
            var mockPlanType = (0, extendType_1.extendType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[2]);
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
                region: dcSpecificPricingRegion.id,
                control_plane: {
                    high_availability: false,
                },
            });
            var mockNodePoolResized = factories_1.nodePoolFactory.build({
                count: 3,
                type: mockPlanType.id,
                nodes: factories_1.kubeLinodeFactory.buildList(3),
            });
            var mockNodePoolInitial = __assign(__assign({}, mockNodePoolResized), { count: 1, nodes: [mockNodePoolResized.nodes[0]] });
            var mockLinodes = mockNodePoolResized.nodes.map(function (node) {
                var _a;
                return factories_1.linodeFactory.build({
                    id: (_a = node.instance_id) !== null && _a !== void 0 ? _a : undefined,
                    ipv4: [(0, random_1.randomIp)()],
                    region: dcSpecificPricingRegion.id,
                    type: mockPlanType.id,
                });
            });
            var mockNodePoolDrawerTitle = "Resize Pool: ".concat(mockPlanType.formattedLabel, " Plan");
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolInitial]).as('getNodePools');
            (0, linodes_1.mockGetLinodes)(mockLinodes).as('getLinodes');
            (0, linodes_1.mockGetLinodeType)(mockPlanType).as('getLinodeType');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait([
                '@getCluster',
                '@getNodePools',
                '@getLinodes',
                '@getVersions',
                '@getLinodeType',
            ]);
            // Confirm that nodes are visible.
            mockNodePoolInitial.nodes.forEach(function (node) {
                cy.get("tr[data-qa-node-row=\"".concat(node.id, "\"]"))
                    .should('be.visible')
                    .within(function () {
                    var nodeLinode = mockLinodes.find(function (linode) { return linode.id === node.instance_id; });
                    if (nodeLinode) {
                        cy.findByText(nodeLinode.label).should('be.visible');
                    }
                });
            });
            // Confirm total price is listed in Kube Specs.
            cy.findByText('$0.00/month').should('be.visible');
            // Click "Resize Pool" and increase size to 4 nodes.
            ui_1.ui.button
                .findByTitle('Resize Pool')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockUpdateNodePool)(mockCluster.id, mockNodePoolResized).as('resizeNodePool');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePoolResized]).as('getNodePools');
            ui_1.ui.drawer
                .findByTitle(mockNodePoolDrawerTitle)
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.disabled');
                cy.findByText('Current price: $0/month (1 node at $0/month each)').should('be.visible');
                cy.findByText('Resized price: $0/month (1 node at $0/month each)').should('be.visible');
                cy.findByLabelText('Add 1')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.focused().click();
                cy.focused().click();
                cy.findByLabelText('Edit Quantity').should('have.value', '4');
                cy.findByText('Current price: $0/month (1 node at $0/month each)').should('be.visible');
                cy.findByText('Resized price: $0/month (4 nodes at $0/month each)').should('be.visible');
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@resizeNodePool', '@getNodePools']);
            // Confirm total price is still $0 in Kube Specs.
            cy.findByText('$0.00/month').should('be.visible');
        });
        /*
         * - Confirms UI flow when adding node pools using mocked API responses.
         * - Confirms that drawer reflects $0 prices.
         * - Confirms that details page still shows $0 pricing after adding node pool.
         */
        it('can add node pools with region prices of $0', function () {
            var dcSpecificPricingRegion = (0, regions_1.getRegionById)('us-southeast');
            var mockPlanType = (0, extendType_1.extendType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[2]);
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                k8s_version: lke_1.latestKubernetesVersion,
                region: dcSpecificPricingRegion.id,
                control_plane: {
                    high_availability: false,
                },
            });
            var mockNewNodePool = factories_1.nodePoolFactory.build({
                count: 2,
                type: mockPlanType.id,
                nodes: factories_1.kubeLinodeFactory.buildList(2),
            });
            var mockNodePool = factories_1.nodePoolFactory.build({
                count: 1,
                type: mockPlanType.id,
                nodes: factories_1.kubeLinodeFactory.buildList(1),
            });
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool]).as('getNodePools');
            (0, lke_2.mockGetKubernetesVersions)().as('getVersions');
            (0, lke_2.mockAddNodePool)(mockCluster.id, mockNewNodePool).as('addNodePool');
            (0, linodes_1.mockGetLinodeType)(mockPlanType).as('getLinodeType');
            (0, linodes_1.mockGetLinodeTypes)(dc_specific_pricing_1.dcPricingMockLinodeTypes);
            (0, lke_2.mockGetDashboardUrl)(mockCluster.id);
            (0, lke_2.mockGetApiEndpoints)(mockCluster.id);
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait([
                '@getCluster',
                '@getNodePools',
                '@getVersions',
                '@getLinodeType',
            ]);
            // Assert that initial node pool is shown on the page.
            cy.findByText(mockPlanType.formattedLabel, { selector: 'h2' }).should('be.visible');
            // Confirm total price of $0 is listed in Kube Specs.
            cy.findByText('$0.00/month').should('be.visible');
            // Add a new node pool, select plan, submit form in drawer.
            ui_1.ui.button
                .findByTitle('Add a Node Pool')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockGetClusterPools)(mockCluster.id, [mockNodePool, mockNewNodePool]).as('getNodePools');
            ui_1.ui.drawer
                .findByTitle("Add a Node Pool: ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                cy.findByText('Shared CPU')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.findByText('Linode 2 GB')
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    // Assert that $0 prices are displayed the plan table, then add a node pool with 2 linodes.
                    cy.findAllByText('$0').should('have.length', 2);
                    cy.findByLabelText('Add 1').should('be.visible').click();
                    cy.focused().click();
                });
                // Assert that $0 prices are displayed as helper text.
                cy.contains('This pool will add $0/month (2 nodes at $0/month) to this cluster.').should('be.visible');
                ui_1.ui.button
                    .findByTitle('Add pool')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Wait for API responses.
            cy.wait(['@addNodePool', '@getNodePools']);
            // Confirm total price is still $0 in Kube Specs.
            cy.findByText('$0.00/month').should('be.visible');
        });
    });
});
describe('LKE ACL updates', function () {
    var mockCluster = factories_1.kubernetesClusterFactory.build();
    var mockRevisionId = (0, random_2.randomString)(20);
    /**
     * - Confirms LKE ACL is only rendered if an account has the corresponding capability
     */
    it('does not show ACL without the LKE ACL capability', function () {
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: [],
        })).as('getAccount');
        (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
        cy.wait(['@getAccount', '@getCluster']);
        cy.contains('Control Plane ACL').should('not.exist');
    });
    describe('with LKE ACL account capability', function () {
        beforeEach(function () {
            (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
                capabilities: ['LKE Network Access Control List (IP ACL)'],
            })).as('getAccount');
        });
        /**
         * - Confirms ACL can be enabled from the summary page
         * - Confirms revision ID can be updated
         * - Confirms both IPv4 and IPv6 can be updated and that summary page and drawer updates as a result
         */
        it('can enable ACL on an LKE cluster with ACL pre-installed and edit IPs', function () {
            var mockACLOptions = factories_1.kubernetesControlPlaneACLOptionsFactory.build({
                enabled: false,
                addresses: { ipv4: ['10.0.3.0/24'], ipv6: undefined },
            });
            var mockUpdatedACLOptions1 = factories_1.kubernetesControlPlaneACLOptionsFactory.build({
                enabled: true,
                'revision-id': mockRevisionId,
                addresses: { ipv4: ['10.0.0.0/24'], ipv6: undefined },
            });
            var mockControlPaneACL = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: mockACLOptions,
            });
            var mockUpdatedControlPlaneACL1 = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: mockUpdatedACLOptions1,
            });
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, mockControlPaneACL).as('getControlPlaneACL');
            (0, lke_2.mockUpdateControlPlaneACL)(mockCluster.id, mockUpdatedControlPlaneACL1).as('updateControlPlaneACL');
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getAccount', '@getCluster', '@getControlPlaneACL']);
            // confirm summary panel
            cy.contains('Control Plane ACL').should('be.visible');
            ui_1.ui.button
                .findByTitle('Enable')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle("Control Plane ACL for ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                // Confirm submit button is disabled if form has not been changed
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('not.be.enabled');
                // Enable ACL
                cy.contains('Activation Status').should('be.visible');
                ui_1.ui.toggle
                    .find()
                    .should('have.attr', 'data-qa-toggle', 'false')
                    .should('be.visible')
                    .click();
                // confirm submit button is now enabled
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled');
                // Edit Revision ID
                cy.findByLabelText('Revision ID').should('have.value', mockACLOptions['revision-id']);
                cy.findByLabelText('Revision ID').clear();
                cy.focused().type(mockRevisionId);
                // Addresses section: confirm current IPv4 value and enter new IP
                cy.findByDisplayValue('10.0.3.0/24').should('be.visible').click();
                cy.focused().clear();
                cy.focused().type('10.0.0.0/24');
                // submit
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@updateControlPlaneACL']);
            // confirm summary panel updates
            cy.contains('Control Plane ACL').should('be.visible');
            cy.findByText('Enable').should('not.exist');
            ui_1.ui.button
                .findByTitle('Enabled (1 IP Address)')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // update mocks
            var mockUpdatedACLOptions2 = factories_1.kubernetesControlPlaneACLOptionsFactory.build({
                enabled: true,
                'revision-id': mockRevisionId,
                addresses: {
                    ipv4: ['10.0.0.0/24'],
                    ipv6: [
                        '8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e',
                        'f4a2:b849:4a24:d0d9:15f0:704b:f943:718f',
                    ],
                },
            });
            var mockUpdatedControlPlaneACL2 = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: mockUpdatedACLOptions2,
            });
            (0, lke_2.mockUpdateControlPlaneACL)(mockCluster.id, mockUpdatedControlPlaneACL2).as('updateControlPlaneACL');
            // confirm data within drawer is updated and edit IPs again
            ui_1.ui.drawer
                .findByTitle("Control Plane ACL for ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                // Confirm submit button is disabled if form has not been changed
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('not.be.enabled');
                // confirm enable toggle was updated
                ui_1.ui.toggle
                    .find()
                    .should('have.attr', 'data-qa-toggle', 'true')
                    .should('be.visible');
                // confirm Revision ID was updated
                cy.findByLabelText('Revision ID').should('have.value', mockRevisionId);
                // update IPv6 addresses
                cy.findByDisplayValue('10.0.0.0/24').should('be.visible');
                cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
                cy.findByText('Add IPv6 Address')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-1')
                    .should('be.visible')
                    .click();
                cy.focused().type('f4a2:b849:4a24:d0d9:15f0:704b:f943:718f');
                // submit
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@updateControlPlaneACL']);
            // confirm summary panel updates
            cy.contains('Control Plane ACL').should('be.visible');
            cy.findByText('Enable').should('not.exist');
            ui_1.ui.button
                .findByTitle('Enabled (3 IP Addresses)')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // confirm data within drawer is updated again
            ui_1.ui.drawer
                .findByTitle("Control Plane ACL for ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                // confirm updated IPv6 addresses display
                cy.findByDisplayValue('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e').should('be.visible');
                cy.findByDisplayValue('f4a2:b849:4a24:d0d9:15f0:704b:f943:718f').should('be.visible');
            });
        });
        /**
         * - Confirms ACL can be disabled from the summary page (for standard tier only)
         * - Confirms both IPv4 and IPv6 can be updated and that drawer updates as a result
         */
        it('can disable ACL on a standard tier cluster and edit IPs', function () {
            var mockACLOptions = factories_1.kubernetesControlPlaneACLOptionsFactory.build({
                enabled: true,
                addresses: { ipv4: undefined, ipv6: undefined },
            });
            var mockUpdatedACLOptions1 = factories_1.kubernetesControlPlaneACLOptionsFactory.build({
                enabled: false,
                addresses: {
                    ipv4: ['10.0.0.0/24'],
                    ipv6: ['8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e'],
                },
            });
            var mockControlPaneACL = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: mockACLOptions,
            });
            var mockUpdatedControlPlaneACL1 = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: mockUpdatedACLOptions1,
            });
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, mockControlPaneACL).as('getControlPlaneACL');
            (0, lke_2.mockUpdateControlPlaneACL)(mockCluster.id, mockUpdatedControlPlaneACL1).as('updateControlPlaneACL');
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getAccount', '@getCluster', '@getControlPlaneACL']);
            // confirm summary panel
            cy.contains('Control Plane ACL').should('be.visible');
            ui_1.ui.button
                .findByTitle('Enabled (0 IP Addresses)')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle("Control Plane ACL for ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                // Confirm submit button is disabled if form has not been changed
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('not.be.enabled');
                // Activation Status section: toggle off 'Enable'
                cy.contains('Activation Status').should('be.visible');
                ui_1.ui.toggle
                    .find()
                    .should('have.attr', 'data-qa-toggle', 'true')
                    .should('be.visible')
                    .click();
                // confirm submit button is now enabled
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled');
                // confirm Revision ID section
                cy.findByLabelText('Revision ID').should('have.value', mockACLOptions['revision-id']);
                // Addresses Section: update IPv4
                cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().type('10.0.0.0/24');
                cy.findByText('Add IPv4 Address')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // update IPv6
                cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
                cy.findByText('Add IPv6 Address')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // submit
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@updateControlPlaneACL']);
            // confirm summary panel updates
            cy.contains('Control Plane ACL').should('be.visible');
            cy.findByText('Enabled (O IP Addresses)').should('not.exist');
            ui_1.ui.button
                .findByTitle('Enable')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // confirm data within drawer is updated
            ui_1.ui.drawer
                .findByTitle("Control Plane ACL for ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                // confirm enable toggle was updated
                ui_1.ui.toggle
                    .find()
                    .should('have.attr', 'data-qa-toggle', 'false')
                    .should('be.visible');
                // confirm updated IP addresses display
                cy.findByDisplayValue('10.0.0.0/24').should('be.visible');
                cy.findByDisplayValue('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e').should('be.visible');
            });
        });
        /**
         * - Confirms ACL can be enabled from the summary page when cluster does not have ACL pre-installed
         * - Confirms drawer appearance when APL is not pre-installed
         * - Confirms that request to correct endpoint is sent
         */
        it('can enable ACL on an LKE cluster with ACL not pre-installed and edit IPs', function () {
            var mockACLOptions = factories_1.kubernetesControlPlaneACLOptionsFactory.build({
                enabled: true,
                addresses: { ipv4: ['10.0.0.0/24'] },
            });
            var mockControlPaneACL = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: mockACLOptions,
            });
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetControlPlaneACLError)(mockCluster.id).as('getControlPlaneACLError');
            (0, lke_2.mockUpdateCluster)(mockCluster.id, __assign(__assign({}, mockCluster), { control_plane: mockControlPaneACL })).as('updateCluster');
            (0, lke_2.mockGetClusterPools)(mockCluster.id, mockNodePools).as('getNodePools');
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait([
                '@getAccount',
                '@getCluster',
                '@getControlPlaneACLError',
                '@getNodePools',
            ]);
            cy.contains('Control Plane ACL').should('be.visible');
            cy.findAllByTestId('circle-progress').should('be.visible');
            // query retries once if failed
            cy.wait('@getControlPlaneACLError');
            ui_1.ui.button
                .findByTitle('Enable')
                .should('be.visible')
                .should('be.enabled')
                .click();
            (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, mockControlPaneACL).as('getControlPlaneACL');
            ui_1.ui.drawer
                .findByTitle("Control Plane ACL for ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                // Confirm installation notice is displayed
                cy.contains('Control Plane ACL has not yet been installed on this cluster. During installation, it may take up to 15 minutes for the access control list to be fully enforced.').should('be.visible');
                // Confirm Activation Status section and Enable ACL
                cy.contains('Activation Status').should('be.visible');
                ui_1.ui.toggle
                    .find()
                    .should('have.attr', 'data-qa-toggle', 'false')
                    .should('be.visible')
                    .click();
                // Revision ID section does not exist
                cy.contains('Revision ID').should('not.exist');
                // Addresses section: add IP addresses
                cy.findByText('Addresses').should('be.visible');
                cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().type('10.0.0.0/24');
                cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
                // submit
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@updateCluster', '@getControlPlaneACL']);
            // confirm summary panel updates
            cy.contains('Control Plane ACL').should('be.visible');
            cy.findByText('Enabled (2 IP Addresses)').should('be.exist');
        });
        /**
         * - Confirms IP validation error appears when a bad IP is entered
         * - Confirms IP validation error disappears when a valid IP is entered
         * - Confirms API error appears as expected and doesn't crash the page
         */
        it('can handle validation and API errors', function () {
            var mockACLOptions = factories_1.kubernetesControlPlaneACLOptionsFactory.build({
                enabled: true,
                addresses: { ipv4: undefined, ipv6: undefined },
            });
            var mockControlPaneACL = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: mockACLOptions,
            });
            var mockErrorMessage = 'Control Plane ACL error: failed to update ACL';
            (0, lke_2.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_2.mockGetControlPlaneACL)(mockCluster.id, mockControlPaneACL).as('getControlPlaneACL');
            (0, lke_2.mockUpdateControlPlaneACLError)(mockCluster.id, mockErrorMessage, 400).as('updateControlPlaneACLError');
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id));
            cy.wait(['@getAccount', '@getCluster', '@getControlPlaneACL']);
            // confirm summary panel
            cy.contains('Control Plane ACL').should('be.visible');
            ui_1.ui.button
                .findByTitle('Enabled (0 IP Addresses)')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle("Control Plane ACL for ".concat(mockCluster.label))
                .should('be.visible')
                .within(function () {
                // Confirm ACL IP validation works as expected for IPv4
                cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().type('invalid ip');
                // click out of textbox and confirm error is visible
                cy.contains('Addresses').should('be.visible').click();
                cy.contains('Must be a valid IPv4 address.').should('be.visible');
                // enter valid IP
                cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().clear();
                cy.focused().type('10.0.0.0/24');
                // Click out of textbox and confirm error is gone
                cy.contains('Addresses').should('be.visible').click();
                cy.contains('Must be a valid IPv4 address.').should('not.exist');
                // Confirm ACL IP validation works as expected for IPv6
                cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().type('invalid ip');
                // click out of textbox and confirm error is visible
                cy.findByText('Addresses').should('be.visible').click();
                cy.contains('Must be a valid IPv6 address.').should('be.visible');
                // enter valid IP
                cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().clear();
                cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
                // Click out of textbox and confirm error is gone
                cy.findByText('Addresses').should('be.visible').click();
                cy.contains('Must be a valid IPv6 address.').should('not.exist');
                // submit
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@updateControlPlaneACLError']);
            cy.contains(mockErrorMessage).should('be.visible');
        });
        it('can handle validation for an enterprise cluster', function () {
            var mockEnterpriseCluster = factories_1.kubernetesClusterFactory.build({
                tier: 'enterprise',
            });
            var mockACLOptions = factories_1.kubernetesControlPlaneACLOptionsFactory.build({
                addresses: { ipv4: ['127.0.0.1'], ipv6: undefined },
                enabled: true,
            });
            var mockControlPaneACL = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: mockACLOptions,
            });
            (0, lke_2.mockGetCluster)(mockEnterpriseCluster).as('getCluster');
            (0, lke_2.mockGetControlPlaneACL)(mockEnterpriseCluster.id, mockControlPaneACL).as('getControlPlaneACL');
            cy.visitWithLogin("/kubernetes/clusters/".concat(mockEnterpriseCluster.id));
            cy.wait(['@getAccount', '@getCluster', '@getControlPlaneACL']);
            cy.contains('Control Plane ACL').should('be.visible');
            ui_1.ui.button
                .findByTitle('Enabled (1 IP Address)')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle("Control Plane ACL for ".concat(mockEnterpriseCluster.label))
                .should('be.visible')
                .within(function () {
                // Clear the existing IP
                cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().clear();
                // Try to submit the form without any IPs
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // Confirm validation error prevents this
                cy.findByText('At least one IP address or CIDR range is required for LKE Enterprise.').should('be.visible');
                // Add at least one IP
                cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
                    .should('be.visible')
                    .click();
                cy.focused().clear();
                cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
                // Resubmit the form
                ui_1.ui.button
                    .findByTitle('Update')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // Confirm error message disappears
                cy.findByText('At least one IP address or CIDR range is required for LKE Enterprise.').should('not.exist');
            });
        });
    });
});
