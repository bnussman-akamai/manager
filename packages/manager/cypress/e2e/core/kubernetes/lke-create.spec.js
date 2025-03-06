"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file LKE creation end-to-end tests.
 */
var factories_1 = require("src/factories");
var lke_1 = require("support/intercepts/lke");
var betas_1 = require("support/intercepts/betas");
var account_1 = require("support/intercepts/account");
var regions_1 = require("support/intercepts/regions");
var regions_2 = require("support/util/regions");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var linodes_1 = require("support/intercepts/linodes");
var feature_flags_1 = require("support/intercepts/feature-flags");
var regions_3 = require("support/util/regions");
var kubeUtils_1 = require("src/features/Kubernetes/kubeUtils");
var constants_1 = require("src/features/Kubernetes/constants");
var kubernetes_1 = require("src/utilities/pricing/kubernetes");
var lke_2 = require("support/constants/lke");
var factories_2 = require("src/factories");
var pluralize_1 = require("src/utilities/pluralize");
var dedicatedNodeCount = 4;
var nanodeNodeCount = 3;
var clusterRegion = (0, regions_3.chooseRegion)({
    capabilities: ['Kubernetes'],
});
var dedicatedCpuPool = factories_1.nodePoolFactory.build({
    count: dedicatedNodeCount,
    nodes: factories_1.kubeLinodeFactory.buildList(dedicatedNodeCount),
    type: 'g6-dedicated-2',
});
var nanodeMemoryPool = factories_1.nodePoolFactory.build({
    count: nanodeNodeCount,
    nodes: factories_1.kubeLinodeFactory.buildList(nanodeNodeCount),
    type: 'g6-nanode-1',
});
var dedicatedType = factories_1.dedicatedTypeFactory.build({
    disk: 81920,
    id: 'g6-dedicated-2',
    label: 'Dedicated 4 GB',
    memory: 4096,
    price: {
        hourly: 0.054,
        monthly: 36.0,
    },
    region_prices: (_a = dc_specific_pricing_1.dcPricingMockLinodeTypes.find(function (type) { return type.id === 'g6-dedicated-2'; })) === null || _a === void 0 ? void 0 : _a.region_prices,
    vcpus: 2,
});
var nanodeType = factories_1.linodeTypeFactory.build({
    disk: 25600,
    id: 'g6-nanode-1',
    label: 'Linode 2 GB',
    memory: 2048,
    price: {
        hourly: 0.0075,
        monthly: 5.0,
    },
    region_prices: (_b = dc_specific_pricing_1.dcPricingMockLinodeTypes.find(function (type) { return type.id === 'g6-nanode-1'; })) === null || _b === void 0 ? void 0 : _b.region_prices,
    vcpus: 1,
});
var gpuType = factories_1.linodeTypeFactory.build({
    class: 'gpu',
    id: 'g2-gpu-1',
});
var highMemType = factories_1.linodeTypeFactory.build({
    class: 'highmem',
    id: 'g7-highmem-1',
});
var premiumType = factories_1.linodeTypeFactory.build({
    class: 'premium',
    id: 'g7-premium-1',
});
var mockedLKEClusterPrices = [
    {
        id: 'lke-sa',
        label: 'LKE Standard Availability',
        price: {
            hourly: 0.0,
            monthly: 0.0,
        },
        region_prices: [],
        transfer: 0,
    },
];
var mockedLKEHAClusterPrices = [
    {
        id: 'lke-ha',
        label: 'LKE High Availability',
        price: {
            hourly: 0.09,
            monthly: 60.0,
        },
        region_prices: [],
        transfer: 0,
    },
];
var mockedLKEEnterprisePrices = [
    factories_1.lkeHighAvailabilityTypeFactory.build(),
    factories_2.lkeEnterpriseTypeFactory.build(),
];
var clusterPlans = [
    {
        nodeCount: dedicatedNodeCount,
        planName: 'Dedicated 4 GB',
        size: 4,
        tab: 'Dedicated CPU',
        type: 'dedicated',
    },
    {
        nodeCount: nanodeNodeCount,
        planName: 'Linode 2 GB',
        size: 24,
        tab: 'Shared CPU',
        type: 'nanode',
    },
];
var mockedLKEClusterTypes = [
    dedicatedType,
    nanodeType,
    gpuType,
    highMemType,
    premiumType,
];
var validEnterprisePlanTabs = [
    'Dedicated CPU',
    'Shared CPU',
    'High Memory',
    'Premium CPU',
];
var validStandardPlanTabs = __spreadArray(__spreadArray([], validEnterprisePlanTabs, true), ['GPU'], false);
describe('LKE Cluster Creation', function () {
    /*
     * - Confirms that users can create a cluster by completing the LKE create form.
     * - Confirms that LKE cluster is created.
     * - Confirms that user is redirected to new LKE cluster summary page.
     * - Confirms that correct information is shown on the LKE cluster summary page
     * - Confirms that new LKE cluster summary page shows expected node pools.
     * - Confirms that new LKE cluster is shown on LKE clusters landing page.
     */
    var clusterLabel = (0, random_1.randomLabel)();
    var clusterVersion = '1.31';
    var mockedLKECluster = factories_1.kubernetesClusterFactory.build({
        label: clusterLabel,
        region: clusterRegion.id,
    });
    var mockedLKEClusterPools = [nanodeMemoryPool, dedicatedCpuPool];
    var mockedLKEClusterControlPlane = factories_1.kubernetesControlPlaneACLFactory.build();
    var _a = (0, kubeUtils_1.getTotalClusterMemoryCPUAndStorage)(mockedLKEClusterPools, mockedLKEClusterTypes), totalCpu = _a.CPU, totalMemory = _a.RAM, totalStorage = _a.Storage;
    it('can create an LKE cluster', function () {
        (0, lke_1.mockCreateCluster)(mockedLKECluster).as('createCluster');
        (0, lke_1.mockGetCluster)(mockedLKECluster).as('getCluster');
        (0, lke_1.mockGetClusterPools)(mockedLKECluster.id, mockedLKEClusterPools).as('getClusterPools');
        (0, lke_1.mockGetDashboardUrl)(mockedLKECluster.id).as('getDashboardUrl');
        (0, lke_1.mockGetControlPlaneACL)(mockedLKECluster.id, mockedLKEClusterControlPlane).as('getControlPlaneACL');
        (0, lke_1.mockGetApiEndpoints)(mockedLKECluster.id).as('getApiEndpoints');
        (0, linodes_1.mockGetLinodeTypes)(mockedLKEClusterTypes).as('getLinodeTypes');
        (0, lke_1.mockGetLKEClusterTypes)(mockedLKEClusterPrices).as('getLKEClusterTypes');
        (0, lke_1.mockGetClusters)([mockedLKECluster]).as('getClusters');
        (0, lke_1.mockGetKubernetesVersions)([clusterVersion]).as('getKubernetesVersions');
        cy.visitWithLogin('/kubernetes/clusters');
        ui_1.ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', '/kubernetes/create');
        // Fill out LKE creation form label, region, and Kubernetes version fields.
        cy.get('[data-qa-textfield-label="Cluster Label"]')
            .should('be.visible')
            .click();
        cy.focused().type("".concat(clusterLabel, "{enter}"));
        ui_1.ui.regionSelect.find().click().type("".concat(clusterRegion.label, "{enter}"));
        ui_1.ui.autocomplete
            .findByLabel('Kubernetes Version')
            .click()
            .type("".concat(clusterVersion, "{enter}"));
        cy.get('[data-testid="ha-radio-button-no"]').should('be.visible').click();
        var monthPrice = 0;
        // Confirm the expected available plans display.
        validStandardPlanTabs.forEach(function (tab) {
            ui_1.ui.tabList.findTabByTitle(tab).should('be.visible');
        });
        // Add a node pool for each selected plan, and confirm that the
        // selected node pool plan is added to the checkout bar.
        clusterPlans.forEach(function (clusterPlan) {
            var nodeCount = clusterPlan.nodeCount;
            var planName = clusterPlan.planName;
            cy.log("Adding ".concat(nodeCount, "x ").concat(planName, " node(s)"));
            // Click the right tab for the plan, and add a node pool with the desired
            // number of nodes.
            cy.findByText(clusterPlan.tab).should('be.visible').click();
            var quantityInput = '[name="Quantity"]';
            cy.findByText(planName)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.get(quantityInput).should('be.visible');
                cy.get(quantityInput).click();
                cy.get(quantityInput).type("{selectall}".concat(nodeCount));
                ui_1.ui.button
                    .findByTitle('Add')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that node pool is shown in the checkout bar.
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                // It's possible that multiple pools of the same type get added.
                // We're taking a naive approach here by confirming that at least one
                // instance of the pool appears in the checkout bar.
                cy.findAllByText("".concat(planName, " Plan")).first().should('be.visible');
            });
            // Expected information on the LKE cluster summary page.
            monthPrice = (0, kubernetes_1.getTotalClusterPrice)({
                highAvailabilityPrice: 0,
                pools: [nanodeMemoryPool, dedicatedCpuPool],
                region: clusterRegion.id,
                types: mockedLKEClusterTypes,
            });
        });
        // Create LKE cluster.
        cy.get('[data-testid="kube-checkout-bar"]')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Wait for LKE cluster to be created and confirm that we are redirected
        // to the cluster summary page.
        cy.wait([
            '@getCluster',
            '@getClusterPools',
            '@createCluster',
            '@getLKEClusterTypes',
            '@getLinodeTypes',
            '@getDashboardUrl',
            '@getControlPlaneACL',
            '@getApiEndpoints',
        ]);
        cy.url().should('endWith', "/kubernetes/clusters/".concat(mockedLKECluster.id, "/summary"));
        // Confirm that each node pool is shown.
        clusterPlans.forEach(function (clusterPlan) {
            // Because multiple node pools may have identical labels, we figure out
            // how many identical labels for each plan will exist and confirm that
            // the expected number is present.
            var nodePoolLabel = clusterPlan.planName;
            var similarNodePoolCount = getSimilarPlans(clusterPlan, clusterPlans)
                .length;
            // Confirm that the cluster created with the expected parameters.
            cy.findAllByText("".concat(clusterRegion.label)).should('be.visible');
            cy.findAllByText("".concat(totalCpu, " CPU Cores")).should('be.visible');
            cy.findAllByText("".concat(Math.round(totalStorage / 1024), " GB Storage")).should('be.visible');
            cy.findAllByText("".concat(Math.round(totalMemory / 1024), " GB RAM")).should('be.visible');
            cy.findAllByText("$".concat(monthPrice.toFixed(2), "/month")).should('be.visible');
            cy.contains('Kubernetes API Endpoint').should('be.visible');
            cy.contains('linodelke.net:443').should('be.visible');
            cy.findAllByText(nodePoolLabel, { selector: 'h2' })
                .should('have.length', similarNodePoolCount)
                .first()
                .should('be.visible');
            // Confirm total number of nodes are shown for each pool
            cy.findAllByText((0, pluralize_1.pluralize)('Node', 'Nodes', clusterPlan.nodeCount)).should('be.visible');
        });
        ui_1.ui.breadcrumb
            .find()
            .should('be.visible')
            .within(function () {
            cy.findByText(clusterLabel).should('be.visible');
        });
    });
});
describe('LKE Cluster Creation with APL enabled', function () {
    it('can create an LKE cluster with APL flag enabled', function () {
        var _a, _b;
        var clusterLabel = (0, random_1.randomLabel)();
        var mockedLKECluster = factories_1.kubernetesClusterFactory.build({
            label: clusterLabel,
            region: clusterRegion.id,
        });
        var mockedLKEClusterPools = [nanodeMemoryPool, dedicatedCpuPool];
        var mockedLKEClusterControlPlane = factories_1.kubernetesControlPlaneACLFactory.build();
        var dedicated4Type = factories_1.dedicatedTypeFactory.build({
            disk: 163840,
            id: 'g6-dedicated-4',
            label: 'Dedicated 8GB',
            memory: 8192,
            price: {
                hourly: 0.108,
                monthly: 72.0,
            },
            region_prices: (_a = dc_specific_pricing_1.dcPricingMockLinodeTypes.find(function (type) { return type.id === 'g6-dedicated-8'; })) === null || _a === void 0 ? void 0 : _a.region_prices,
            vcpus: 4,
        });
        var dedicated8Type = factories_1.dedicatedTypeFactory.build({
            disk: 327680,
            id: 'g6-dedicated-8',
            label: 'Dedicated 16GB',
            memory: 16384,
            price: {
                hourly: 0.216,
                monthly: 144.0,
            },
            region_prices: (_b = dc_specific_pricing_1.dcPricingMockLinodeTypes.find(function (type) { return type.id === 'g6-dedicated-8'; })) === null || _b === void 0 ? void 0 : _b.region_prices,
            vcpus: 8,
        });
        var mockedAPLLKEClusterTypes = [
            dedicatedType,
            dedicated4Type,
            dedicated8Type,
            nanodeType,
        ];
        (0, feature_flags_1.mockAppendFeatureFlags)({
            apl: {
                enabled: true,
            },
        }).as('getFeatureFlags');
        (0, betas_1.mockGetAccountBeta)({
            id: 'apl',
            label: 'Akamai App Platform Beta',
            enrolled: '2024-11-04T21:39:41',
            description: 'Akamai App Platform is a platform that combines developer and operations-centric tools, automation and self-service to streamline the application lifecycle when using Kubernetes. This process will pre-register you for an upcoming beta.',
            started: '2024-10-31T18:00:00',
            ended: null,
        }).as('getAccountBeta');
        (0, lke_1.mockCreateCluster)(mockedLKECluster).as('createCluster');
        (0, lke_1.mockGetCluster)(mockedLKECluster).as('getCluster');
        (0, lke_1.mockGetClusterPools)(mockedLKECluster.id, mockedLKEClusterPools).as('getClusterPools');
        (0, lke_1.mockGetDashboardUrl)(mockedLKECluster.id).as('getDashboardUrl');
        (0, lke_1.mockGetControlPlaneACL)(mockedLKECluster.id, mockedLKEClusterControlPlane).as('getControlPlaneACL');
        (0, linodes_1.mockGetLinodeTypes)(mockedAPLLKEClusterTypes).as('getLinodeTypes');
        (0, lke_1.mockGetLKEClusterTypes)(mockedLKEHAClusterPrices).as('getLKEClusterTypes');
        (0, lke_1.mockGetApiEndpoints)(mockedLKECluster.id).as('getApiEndpoints');
        cy.visitWithLogin('/kubernetes/create');
        cy.wait([
            '@getFeatureFlags',
            '@getAccountBeta',
            '@getLinodeTypes',
            '@getLKEClusterTypes',
        ]);
        // Enter cluster details
        cy.get('[data-qa-textfield-label="Cluster Label"]')
            .should('be.visible')
            .click();
        cy.focused().type("".concat(clusterLabel, "{enter}"));
        ui_1.ui.regionSelect.find().click().type("".concat(clusterRegion.label, "{enter}"));
        cy.findByTestId('apl-label').should('have.text', 'Akamai App Platform');
        cy.findByTestId('apl-radio-button-yes').should('be.visible').click();
        cy.findByTestId('ha-radio-button-yes').should('be.disabled');
        cy.get('[aria-label="Enabled by default when Akamai App Platform is enabled."]').should('be.visible');
        // Check that Shared CPU plans are disabled
        ui_1.ui.tabList.findTabByTitle('Shared CPU').click();
        cy.findByText('Shared CPU instances are currently not available for Akamai App Platform.').should('be.visible');
        cy.get('[data-qa-plan-row="Linode 2 GB"]').should('have.attr', 'disabled');
        // Check that Dedicated CPU plans are available if greater than 8GB
        ui_1.ui.tabList.findTabByTitle('Dedicated CPU').click();
        cy.get('[data-qa-plan-row="Dedicated 4 GB"]').should('have.attr', 'disabled');
        cy.get('[data-qa-plan-row="Dedicated 8 GB"]').should('not.have.attr', 'disabled');
        cy.get('[data-qa-plan-row="Dedicated 16 GB"]').within(function () {
            cy.get('[name="Quantity"]').click();
            cy.get('[name="Quantity"]').type('{selectall}3');
            ui_1.ui.button
                .findByTitle('Add')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Check that the checkout bar displays the correct information
        cy.get('[data-testid="kube-checkout-bar"]')
            .should('be.visible')
            .within(function () {
            cy.findByText("Dedicated 16 GB Plan").should('be.visible');
            cy.findByText('$432.00').should('be.visible');
            cy.findByText('High Availability (HA) Control Plane').should('be.visible');
            cy.findByText('$60.00/month').should('be.visible');
            cy.findByText('$492.00').should('be.visible');
            ui_1.ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait([
            '@createCluster',
            '@getCluster',
            '@getClusterPools',
            '@getDashboardUrl',
            '@getControlPlaneACL',
            '@getApiEndpoints',
        ]);
    });
});
describe('LKE Cluster Creation with DC-specific pricing', function () {
    /*
     * - Confirms that DC-specific prices are present in the LKE create form.
     * - Confirms that pricing docs link is shown in "Region" section.
     * - Confirms that the plan table shows a message in place of plans when a region is not selected.
     * - Confirms that the cluster summary create button is disabled until a plan and region selection are made.
     * - Confirms that HA helper text updates dynamically to display pricing when a region is selected.
     */
    it('can dynamically update prices when creating an LKE cluster based on region', function () {
        // In staging API, only the Dallas region is available for LKE creation
        var dcSpecificPricingRegion = (0, regions_2.getRegionById)('us-central');
        var clusterLabel = (0, random_1.randomLabel)();
        var clusterPlans = new Array(2)
            .fill(null)
            .map(function () { return (0, random_1.randomItem)(dc_specific_pricing_1.dcPricingLkeClusterPlans); });
        cy.visitWithLogin('/kubernetes/clusters');
        ui_1.ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', '/kubernetes/create');
        (0, linodes_1.mockGetLinodeTypes)(dc_specific_pricing_1.dcPricingMockLinodeTypes).as('getLinodeTypes');
        cy.wait(['@getLinodeTypes']);
        // Confirm that, without a region selected, no pricing information is displayed.
        // Confirm checkout summary displays helper text and disabled create button.
        cy.findByText(dc_specific_pricing_1.dcPricingLkeCheckoutSummaryPlaceholder).should('be.visible');
        cy.get('[data-qa-deploy-linode]')
            .should('contain.text', 'Create Cluster')
            .should('be.disabled');
        // Confirm that plans table displays helper text instead of plans and prices.
        cy.contains(dc_specific_pricing_1.dcPricingPlanPlaceholder).should('be.visible');
        // Confirm that HA pricing displays helper text instead of price.
        cy.contains(dc_specific_pricing_1.dcPricingLkeHAPlaceholder).should('be.visible');
        // Confirm docs link to pricing page is visible.
        cy.findByText(dc_specific_pricing_1.dcPricingDocsLabel)
            .should('be.visible')
            .should('have.attr', 'href', dc_specific_pricing_1.dcPricingDocsUrl);
        // Fill out LKE creation form label, region, and Kubernetes version fields.
        cy.findByLabelText('Cluster Label').should('be.visible').click();
        cy.focused().type("".concat(clusterLabel, "{enter}"));
        ui_1.ui.regionSelect.find().click();
        cy.focused().type("".concat(dcSpecificPricingRegion.label, "{enter}"));
        // Confirm that HA price updates dynamically once region selection is made.
        cy.contains(/\$.*\/month/).should('be.visible');
        cy.get('[data-testid="ha-radio-button-yes"]').should('be.visible').click();
        // Confirm that with region and HA selections, create button is still disabled until plan selection is made.
        cy.get('[data-qa-deploy-linode]')
            .should('contain.text', 'Create Cluster')
            .should('be.disabled');
        // Add a node pool for each randomly selected plan, and confirm that the
        // selected node pool plan is added to the checkout bar.
        clusterPlans.forEach(function (clusterPlan) {
            var nodeCount = (0, random_1.randomNumber)(1, 3);
            var planName = clusterPlan.planName;
            cy.log("Adding ".concat(nodeCount, "x ").concat(clusterPlan.planName, " node(s)"));
            // Click the right tab for the plan, and add a node pool with the desired
            // number of nodes.
            cy.findByText(clusterPlan.tab).should('be.visible').click();
            cy.findByText(planName)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.get('[name="Quantity"]').should('be.visible').click();
                cy.focused().type("{selectall}".concat(nodeCount));
                ui_1.ui.button
                    .findByTitle('Add')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that node pool is shown in the checkout bar.
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                // It's possible that multiple pools of the same type get added.
                // We're taking a naive approach here by confirming that at least one
                // instance of the pool appears in the checkout bar.
                cy.findAllByText("".concat(planName, " Plan")).first().should('be.visible');
            });
        });
        // Confirm that create button is enabled.
        cy.get('[data-testid="kube-checkout-bar"]')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled');
        });
    });
});
describe('LKE Cluster Creation with ACL', function () {
    /**
     * - Confirms ACL flow does not exist if account doesn't have the corresponding capability
     */
    it('does not show the ACL flow without the LKE ACL capability', function () {
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: [],
        })).as('getAccount');
        cy.visitWithLogin('/kubernetes/clusters');
        ui_1.ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', '/kubernetes/create');
        cy.wait(['@getAccount']);
        cy.contains('Control Plane ACL').should('not.exist');
    });
    // setting up mocks
    var clusterLabel = (0, random_1.randomLabel)();
    var mockRegion = factories_1.regionFactory.build({
        capabilities: ['Linodes', 'Kubernetes'],
        id: 'us-east',
        label: 'Newark, US',
    });
    var mockLinodeTypes = [
        factories_1.linodeTypeFactory.build({
            id: 'dedicated-1',
            label: 'dedicated-1',
            class: 'dedicated',
        }),
        factories_1.linodeTypeFactory.build({
            id: 'dedicated-2',
            label: 'dedicated-2',
            class: 'dedicated',
        }),
    ];
    var clusterVersion = '1.31';
    var clusterPlan = { size: 2, tab: 'Dedicated CPU', type: 'Dedicated' };
    var nodeCount = 1;
    var planName = 'dedicated-1';
    var checkoutName = 'dedicated-1 Plan';
    describe('with LKE IPACL account capability', function () {
        beforeEach(function () {
            (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
                capabilities: [
                    'LKE HA Control Planes',
                    'LKE Network Access Control List (IP ACL)',
                ],
            })).as('getAccount');
            (0, regions_1.mockGetRegions)([mockRegion]).as('getRegions');
            (0, linodes_1.mockGetLinodeTypes)(mockLinodeTypes).as('getLinodeTypes');
            (0, regions_1.mockGetRegionAvailability)(mockRegion.id, []).as('getRegionAvailability');
        });
        /**
         * - Confirms create flow when ACL is toggled off
         * - Confirms LKE summary page shows that ACL is not enabled
         */
        it('creates an LKE cluster with ACL disabled', function () {
            var mockACL = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: {
                    enabled: false,
                    'revision-id': '',
                },
            });
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                label: clusterLabel,
                region: mockRegion.id,
                k8s_version: clusterVersion,
                control_plane: mockACL,
            });
            (0, lke_1.mockCreateCluster)(mockCluster).as('createCluster');
            (0, lke_1.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_1.mockGetControlPlaneACL)(mockCluster.id, mockACL).as('getControlPlaneACL');
            cy.visitWithLogin('/kubernetes/clusters');
            ui_1.ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.url().should('endWith', '/kubernetes/create');
            cy.wait(['@getAccount', '@getRegions', '@getLinodeTypes']);
            // Fill out LKE creation form label, region, and Kubernetes version fields.
            cy.findByLabelText('Cluster Label').should('be.visible').click();
            cy.focused().type("".concat(clusterLabel, "{enter}"));
            ui_1.ui.regionSelect.find().click().type("".concat(mockRegion.label, "{enter}"));
            cy.wait(['@getRegionAvailability']);
            cy.findByText('Kubernetes Version').should('be.visible').click();
            cy.focused().type("".concat(clusterVersion, "{enter}"));
            cy.get('[data-testid="ha-radio-button-yes"]')
                .should('be.visible')
                .click();
            // Confirm that ACL is disabled by default.
            cy.contains('Control Plane ACL').should('be.visible');
            ui_1.ui.toggle
                .find()
                .should('have.attr', 'data-qa-toggle', 'false')
                .should('be.visible');
            // Add a node pool
            cy.findByText(clusterPlan.tab).should('be.visible').click();
            cy.findByText(planName)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.get('[name="Quantity"]').should('be.visible').click();
                cy.focused().type("{selectall}".concat(nodeCount));
                ui_1.ui.button
                    .findByTitle('Add')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that node pool is shown in the checkout bar.
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                cy.findAllByText(checkoutName).first().should('be.visible');
            });
            // create cluster
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Create Cluster')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@createCluster').then(function () {
                cy.url().should('endWith', "/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
            });
            cy.wait(['@getCluster', '@getControlPlaneACL']);
            // Confirms Summary panel displays as expected
            cy.contains('Control Plane ACL').should('be.visible');
            ui_1.ui.button.findByTitle('Enable').should('be.visible').should('be.enabled');
        });
        /**
         * - Confirms create flow when ACL is toggled on
         * - Confirms adding IPs
         * - Confirms LKE summary page shows that ACL is enabled
         */
        it('creates an LKE cluster with ACL enabled', function () {
            var mockACLOptions = factories_1.kubernetesControlPlaneACLOptionsFactory.build({
                'revision-id': '',
            });
            var mockACL = factories_1.kubernetesControlPlaneACLFactory.build({
                acl: mockACLOptions,
            });
            var mockCluster = factories_1.kubernetesClusterFactory.build({
                label: clusterLabel,
                region: mockRegion.id,
                k8s_version: clusterVersion,
                control_plane: mockACL,
            });
            (0, lke_1.mockCreateCluster)(mockCluster).as('createCluster');
            (0, lke_1.mockGetCluster)(mockCluster).as('getCluster');
            (0, lke_1.mockGetControlPlaneACL)(mockCluster.id, mockACL).as('getControlPlaneACL');
            cy.visitWithLogin('/kubernetes/clusters');
            ui_1.ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.url().should('endWith', '/kubernetes/create');
            cy.wait(['@getAccount']);
            // Fill out LKE creation form label, region, and Kubernetes version fields.
            cy.findByLabelText('Cluster Label').should('be.visible').click();
            cy.focused().type("".concat(clusterLabel, "{enter}"));
            ui_1.ui.regionSelect.find().click().type("".concat(mockRegion.label, "{enter}"));
            cy.findByText('Kubernetes Version').should('be.visible').click();
            cy.focused().type("".concat(clusterVersion, "{enter}"));
            cy.get('[data-testid="ha-radio-button-yes"]')
                .should('be.visible')
                .click();
            // Confirm ACL is disabled by default, then enable it.
            cy.contains('Control Plane ACL').should('be.visible');
            ui_1.ui.toggle
                .find()
                .should('have.attr', 'data-qa-toggle', 'false')
                .should('be.visible')
                .click();
            ui_1.ui.toggle.find().should('have.attr', 'data-qa-toggle', 'true');
            // Add some IPv4s and an IPv6
            cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
                .should('be.visible')
                .click();
            cy.focused().type('10.0.0.0/24');
            cy.findByText('Add IPv4 Address')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.get('[id="domain-transfer-ip-1"]').should('be.visible').click();
            cy.focused().type('10.0.1.0/24');
            cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
                .should('be.visible')
                .click();
            cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
            cy.findByText('Add IPv6 Address')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Add a node pool
            cy.findByText(clusterPlan.tab).should('be.visible').click();
            cy.findByText(planName)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.get('[name="Quantity"]').should('be.visible').click();
                cy.focused().type("{selectall}".concat(nodeCount));
                ui_1.ui.button
                    .findByTitle('Add')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that node pool is shown in the checkout bar.
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                cy.findAllByText(checkoutName).first().should('be.visible');
            });
            // create cluster
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Create Cluster')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@createCluster').then(function () {
                cy.url().should('endWith', "/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
            });
            cy.wait(['@getCluster', '@getControlPlaneACL']);
            // Confirms Summary panel displays as expected
            cy.contains('Control Plane ACL').should('be.visible');
            ui_1.ui.button
                .findByTitle('Enabled (3 IP Addresses)')
                .should('be.visible')
                .should('be.enabled');
        });
        /**
         * - Confirms IP validation error appears when a bad IP is entered
         * - Confirms IP validation error disappears when a valid IP is entered
         * - Confirms API error appears as expected and doesn't crash the page
         */
        it('can handle validation and API errors', function () {
            var mockErrorMessage = 'Control Plane ACL error: request failed';
            (0, lke_1.mockCreateClusterError)(mockErrorMessage, 400).as('createClusterError');
            cy.visitWithLogin('/kubernetes/clusters');
            ui_1.ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.url().should('endWith', '/kubernetes/create');
            cy.wait(['@getAccount']);
            // Fill out LKE creation form label, region, and Kubernetes version fields.
            cy.findByLabelText('Cluster Label').should('be.visible').click();
            cy.focused().type("".concat(clusterLabel, "{enter}"));
            ui_1.ui.regionSelect.find().click().type("".concat(mockRegion.label, "{enter}"));
            cy.findByText('Kubernetes Version').should('be.visible').click();
            cy.focused().type("".concat(clusterVersion, "{enter}"));
            cy.get('[data-testid="ha-radio-button-yes"]')
                .should('be.visible')
                .click();
            // Enable ACL
            cy.contains('Control Plane ACL').should('be.visible');
            ui_1.ui.toggle
                .find()
                .should('have.attr', 'data-qa-toggle', 'false')
                .should('be.visible')
                .click();
            ui_1.ui.toggle.find().should('have.attr', 'data-qa-toggle', 'true');
            // Confirm ACL IPv4 validation works as expected
            cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
                .should('be.visible')
                .click();
            cy.focused().type('invalid ip');
            // click out of textbox and confirm error is visible
            cy.contains('Control Plane ACL').should('be.visible').click();
            cy.contains('Must be a valid IPv4 address.').should('be.visible');
            // enter valid IP
            cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
                .should('be.visible')
                .click();
            cy.focused().clear();
            cy.focused().type('10.0.0.0/24');
            // Click out of textbox and confirm error is gone
            cy.contains('Control Plane ACL').should('be.visible').click();
            cy.contains('Must be a valid IPv4 address.').should('not.exist');
            // Confirm ACL IPv6 validation works as expected
            cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
                .should('be.visible')
                .click();
            cy.focused().type('invalid ip');
            // click out of textbox and confirm error is visible
            cy.contains('Control Plane ACL').should('be.visible').click();
            cy.contains('Must be a valid IPv6 address.').should('be.visible');
            // enter valid IP
            cy.findByLabelText('IPv6 Addresses or CIDRs ip-address-0')
                .should('be.visible')
                .click();
            cy.focused().clear();
            cy.focused().type('8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e');
            // Click out of textbox and confirm error is gone
            cy.contains('Control Plane ACL').should('be.visible').click();
            cy.contains('Must be a valid IPv6 address.').should('not.exist');
            // Add a node pool
            cy.findByText(clusterPlan.tab).should('be.visible').click();
            cy.findByText(planName)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.get('[name="Quantity"]').should('be.visible').click();
                cy.focused().type("{selectall}".concat(nodeCount));
                ui_1.ui.button
                    .findByTitle('Add')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that node pool is shown in the checkout bar.
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                cy.findAllByText(checkoutName).first().should('be.visible');
            });
            // Attempt to create cluster
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Create Cluster')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm API error displays
            cy.wait('@createClusterError');
            cy.contains(mockErrorMessage).should('be.visible');
        });
    });
});
describe('LKE Cluster Creation with LKE-E', function () {
    /**
     * - Confirms LKE-E flow does not exist if account doesn't have the corresponding capability
     * @todo LKE-E: Remove this test once LKE-E is fully rolled out
     */
    it('does not show the LKE-E flow with the feature flag off', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            lkeEnterprise: { enabled: false, la: false },
        }).as('getFeatureFlags');
        cy.visitWithLogin('/kubernetes/clusters');
        ui_1.ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', '/kubernetes/create');
        cy.contains('Cluster Tier').should('not.exist');
    });
    describe('shows the LKE-E flow with the feature flag on', function () {
        beforeEach(function () {
            // Mock feature flag -- @TODO LKE-E: Remove feature flag once LKE-E is fully rolled out
            (0, feature_flags_1.mockAppendFeatureFlags)({
                lkeEnterprise: { enabled: true, la: true },
            }).as('getFeatureFlags');
        });
        /**
         * - Mocks the LKE-E capability
         * - Confirms the Cluster Tier selection can be made
         * - Confirms that HA is enabled by default with LKE-E selection
         * - Confirms an LKE-E supported region can be selected
         * - Confirms an LKE-E supported k8 version can be selected
         * - Confirms at least one IP must be provided for ACL
         * - Confirms the checkout bar displays the correct LKE-E info
         * - Confirms an enterprise cluster can be created with the correct chip, version, and price
         * - Confirms that the total node count for each pool is displayed
         */
        it('creates an LKE-E cluster with the account capability', function () {
            var clusterLabel = (0, random_1.randomLabel)();
            var mockedEnterpriseCluster = factories_1.kubernetesClusterFactory.build({
                label: clusterLabel,
                region: 'us-iad',
                tier: 'enterprise',
                k8s_version: lke_2.latestEnterpriseTierKubernetesVersion.id,
            });
            var mockedEnterpriseClusterPools = [nanodeMemoryPool, dedicatedCpuPool];
            (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
                capabilities: [
                    'Kubernetes Enterprise',
                    'LKE HA Control Planes',
                    'LKE Network Access Control List (IP ACL)',
                ],
            })).as('getAccount');
            (0, lke_1.mockGetTieredKubernetesVersions)('enterprise', [
                lke_2.latestEnterpriseTierKubernetesVersion,
            ]).as('getTieredKubernetesVersions');
            (0, lke_1.mockGetKubernetesVersions)([lke_2.latestKubernetesVersion]).as('getKubernetesVersions');
            (0, linodes_1.mockGetLinodeTypes)(mockedLKEClusterTypes).as('getLinodeTypes');
            (0, lke_1.mockGetLKEClusterTypes)(mockedLKEEnterprisePrices).as('getLKEEnterpriseClusterTypes');
            (0, regions_1.mockGetRegions)([
                factories_1.regionFactory.build({
                    capabilities: ['Linodes', 'Kubernetes'],
                    id: 'us-east',
                    label: 'Newark, US',
                }),
                factories_1.regionFactory.build({
                    capabilities: ['Linodes', 'Kubernetes', 'Kubernetes Enterprise'],
                    id: 'us-iad',
                    label: 'Washington, DC',
                }),
            ]).as('getRegions');
            (0, lke_1.mockGetCluster)(mockedEnterpriseCluster).as('getCluster');
            (0, lke_1.mockCreateCluster)(mockedEnterpriseCluster).as('createCluster');
            (0, lke_1.mockGetClusters)([mockedEnterpriseCluster]).as('getClusters');
            (0, lke_1.mockGetClusterPools)(mockedEnterpriseCluster.id, mockedEnterpriseClusterPools).as('getClusterPools');
            (0, lke_1.mockGetDashboardUrl)(mockedEnterpriseCluster.id).as('getDashboardUrl');
            (0, lke_1.mockGetApiEndpoints)(mockedEnterpriseCluster.id).as('getApiEndpoints');
            cy.visitWithLogin('/kubernetes/clusters');
            cy.wait(['@getAccount']);
            ui_1.ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.url().should('endWith', '/kubernetes/create');
            cy.wait(['@getKubernetesVersions', '@getTieredKubernetesVersions']);
            cy.findByLabelText('Cluster Label').should('be.visible').click();
            cy.focused().type("".concat(clusterLabel, "{enter}"));
            cy.findByText('Cluster Tier').should('be.visible');
            cy.findByText('Compare Tiers')
                .should('be.visible')
                .should('have.attr', 'href', constants_1.CLUSTER_TIER_DOCS_LINK);
            // Confirm both Cluster Tiers exist and the LKE card is selected by default
            cy.get("[data-qa-select-card-heading=\"LKE\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('have.attr', 'data-qa-selection-card-checked', 'true');
            cy.get("[data-qa-select-card-heading=\"LKE Enterprise\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('have.attr', 'data-qa-selection-card-checked', 'false')
                .click();
            // Select LKE-E as the Cluster Tier
            cy.get("[data-qa-select-card-heading=\"LKE Enterprise\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('have.attr', 'data-qa-selection-card-checked', 'true');
            cy.wait(['@getLKEEnterpriseClusterTypes', '@getRegions']);
            // Confirm unsupported regions are not displayed
            ui_1.ui.regionSelect.find().click().type('Newark, NJ');
            ui_1.ui.autocompletePopper.find().within(function () {
                cy.findByText('Newark, NJ (us-east)').should('not.exist');
            });
            // Select a supported region
            ui_1.ui.regionSelect.find().clear().type('Washington, DC{enter}');
            // Confirm that there is a tooltip explanation for the region dropdown options
            ui_1.ui.tooltip
                .findByText('Only regions that support LKE Enterprise clusters are listed.')
                .should('be.visible');
            // Selects an enterprise version
            ui_1.ui.autocomplete
                .findByLabel('Kubernetes Version')
                .should('be.visible')
                .click();
            cy.findByText('Kubernetes Versions')
                .should('be.visible')
                .should('have.attr', 'href', constants_1.CLUSTER_VERSIONS_DOCS_LINK);
            ui_1.ui.autocompletePopper
                .findByTitle(lke_2.latestEnterpriseTierKubernetesVersion.id)
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm the expected available plans display.
            validEnterprisePlanTabs.forEach(function (tab) {
                ui_1.ui.tabList.findTabByTitle(tab).should('be.visible');
            });
            // Confirm the GPU tab is not visible in the plans panel for LKE-E.
            ui_1.ui.tabList.findTabByTitle('GPU').should('not.exist');
            // Add a node pool for each selected plan, and confirm that the
            // selected node pool plan is added to the checkout bar.
            clusterPlans.forEach(function (clusterPlan) {
                var nodeCount = clusterPlan.nodeCount;
                var planName = clusterPlan.planName;
                cy.log("Adding ".concat(nodeCount, "x ").concat(planName, " node(s)"));
                // Click the right tab for the plan, and add a node pool with the desired
                // number of nodes.
                cy.findByText(clusterPlan.tab).should('be.visible').click();
                var quantityInput = '[name="Quantity"]';
                cy.findByText(planName)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.get(quantityInput).should('be.visible');
                    cy.get(quantityInput).click();
                    cy.get(quantityInput).type("{selectall}".concat(nodeCount));
                    ui_1.ui.button
                        .findByTitle('Add')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
            });
            // Check that the checkout bar displays the correct information
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                // Confirm HA section is hidden since LKE-E includes HA by default
                cy.findByText('High Availability (HA) Control Plane').should('not.exist');
                // Confirm LKE-E section is shown
                cy.findByText('LKE Enterprise').should('be.visible');
                cy.findByText('$300.00/month').should('be.visible');
                cy.findByText('Dedicated 4 GB Plan').should('be.visible');
                cy.findByText('$144.00').should('be.visible');
                cy.findByText('Linode 2 GB Plan').should('be.visible');
                cy.findByText('$15.00').should('be.visible');
                cy.findByText('$459.00').should('be.visible');
                // Try to submit the form
                ui_1.ui.button
                    .findByTitle('Create Cluster')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm error validation requires an ACL IP
            cy.findByText('At least one IP address or CIDR range is required for LKE Enterprise.').should('be.visible');
            // Add an IP
            cy.findByLabelText('IPv4 Addresses or CIDRs ip-address-0')
                .should('be.visible')
                .click();
            cy.focused().clear();
            cy.focused().type('10.0.0.0/24');
            cy.get('[data-testid="kube-checkout-bar"]')
                .should('be.visible')
                .within(function () {
                // Successfully submit the form
                ui_1.ui.button
                    .findByTitle('Create Cluster')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.findByText('At least one IP address or CIDR range is required for LKE Enterprise.').should('not.exist');
            // Wait for LKE cluster to be created and confirm that we are redirected
            // to the cluster summary page.
            cy.wait([
                '@getCluster',
                '@getClusterPools',
                '@createCluster',
                '@getLKEEnterpriseClusterTypes',
                '@getLinodeTypes',
                '@getDashboardUrl',
                '@getApiEndpoints',
            ]);
            cy.url().should('endWith', "/kubernetes/clusters/".concat(mockedEnterpriseCluster.id, "/summary"));
            // Confirm the LKE-E cluster has the correct enterprise chip, version, and pricing.
            cy.findByText('ENTERPRISE').should('be.visible');
            cy.findByText("Version ".concat(lke_2.latestEnterpriseTierKubernetesVersion.id)).should('be.visible');
            cy.findByText('$459.00/month').should('be.visible');
            clusterPlans.forEach(function (clusterPlan) {
                // Confirm total number of nodes are shown for each pool
                cy.findAllByText((0, pluralize_1.pluralize)('Node', 'Nodes', clusterPlan.nodeCount)).should('be.visible');
            });
        });
        it('disables the Cluster Type selection without the LKE-E account capability', function () {
            (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
                capabilities: [],
            })).as('getAccount');
            cy.visitWithLogin('/kubernetes/clusters');
            cy.wait(['@getAccount']);
            ui_1.ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.url().should('endWith', '/kubernetes/create');
            // Confirm the Cluster Tier selection can be made when the LKE-E feature is enabled
            cy.findByText('Cluster Tier').should('be.visible');
            // Confirm both tiers exist and the LKE card is selected by default
            cy.get("[data-qa-select-card-heading=\"LKE\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('have.attr', 'data-qa-selection-card-checked', 'true');
            cy.get("[data-qa-select-card-heading=\"LKE Enterprise\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('have.attr', 'disabled');
        });
    });
});
/**
 * Returns each plan in an array which is similar to the given plan.
 *
 * Plans are considered similar if they have identical type and size.
 *
 * @param clusterPlan - Cluster plan with which to compare similarity.
 * @param clusterPlans - Array from which to find similar cluster plans.
 *
 * @returns Array of similar cluster plans.
 */
var getSimilarPlans = function (clusterPlan, clusterPlans) {
    return clusterPlans.filter(function (otherClusterPlan) {
        return (clusterPlan.type === otherClusterPlan.type &&
            clusterPlan.size === otherClusterPlan.size);
    });
};
