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
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Cypress
// Move this to cypress component testing once the setup is complete - see https://github.com/linode/manager/pull/10134
var ui_1 = require("support/ui");
var factories_1 = require("@src/factories");
var authentication_1 = require("support/api/authentication");
var regions_1 = require("support/intercepts/regions");
var linodes_1 = require("support/intercepts/linodes");
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var mockRegions = [
    factories_1.regionFactory.build({
        capabilities: ['Linodes', 'Kubernetes'],
        id: 'us-east',
        label: 'Newark, NJ',
    }),
];
var mockDedicatedLinodeTypes = [
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
    factories_1.linodeTypeFactory.build({
        id: 'dedicated-3',
        label: 'dedicated-3',
        class: 'dedicated',
    }),
    factories_1.linodeTypeFactory.build({
        id: 'dedicated-4',
        label: 'dedicated-4',
        class: 'dedicated',
    }),
];
var mockSharedLinodeTypes = [
    factories_1.linodeTypeFactory.build({
        id: 'shared-1',
        label: 'shared-1',
        class: 'standard',
    }),
    factories_1.linodeTypeFactory.build({
        id: 'shared-2',
        label: 'shared-2',
        class: 'standard',
    }),
    factories_1.linodeTypeFactory.build({
        id: 'shared-3',
        label: 'shared-3',
        class: 'standard',
    }),
];
var mockHighMemoryLinodeTypes = [
    factories_1.linodeTypeFactory.build({
        id: 'highmem-1',
        label: 'highmem-1',
        class: 'highmem',
    }),
];
var mockGPUType = [
    factories_1.linodeTypeFactory.build({
        id: 'gpu-1',
        label: 'gpu-1',
        class: 'gpu',
    }),
    factories_1.linodeTypeFactory.build({
        id: 'gpu-2',
        label: 'gpu-2 Ada',
        class: 'gpu',
    }),
];
var mockAcceleratedType = [
    factories_1.linodeTypeFactory.build({
        id: 'accelerated-1',
        label: 'accelerated-1',
        class: 'accelerated',
    }),
];
var mockLinodeTypes = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], mockDedicatedLinodeTypes, true), mockHighMemoryLinodeTypes, true), mockSharedLinodeTypes, true), mockGPUType, true), mockAcceleratedType, true);
var mockRegionAvailability = [
    factories_1.regionAvailabilityFactory.build({
        plan: 'dedicated-3',
        available: false,
        region: 'us-east',
    }),
    factories_1.regionAvailabilityFactory.build({
        plan: 'dedicated-4',
        available: false,
        region: 'us-east',
    }),
    factories_1.regionAvailabilityFactory.build({
        plan: 'highmem-1',
        available: false,
        region: 'us-east',
    }),
    factories_1.regionAvailabilityFactory.build({
        plan: 'shared-3',
        available: false,
        region: 'us-east',
    }),
];
var linodePlansPanel = '[data-qa-tp="Linode Plan"]';
var k8PlansPanel = '[data-qa-tp="Add Node Pools"]';
var planSelectionTable = 'List of Linode Plans';
var notices = {
    limitedAvailability: '[data-testid="limited-availability-banner"]',
    unavailable: '[data-qa-error="true"]',
};
(0, authentication_1.authenticate)();
describe('displays linode plans panel based on availability', function () {
    beforeEach(function () {
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, linodes_1.mockGetLinodeTypes)(mockLinodeTypes).as('getLinodeTypes');
        (0, regions_1.mockGetRegionAvailability)(mockRegions[0].id, mockRegionAvailability).as('getRegionAvailability');
    });
    it('displays the proper plans based on the region and types', function () {
        cy.visitWithLogin('/linodes/create');
        cy.wait(['@getRegions', '@getLinodeTypes']);
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();
        cy.wait(['@getRegionAvailability']);
        // Dedicated CPU tab
        // Should be selected/open by default
        // Should have the limited availability notice
        // Should contain 5 plans (6 rows including the header row)
        // Should have 3 plans disabled
        // Should not have tooltips for the disabled plans (more than half disabled plans in the panel)
        cy.get(linodePlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 1);
            cy.get(notices.limitedAvailability).should('be.visible');
            cy.findByRole('table', { name: planSelectionTable }).within(function () {
                cy.findAllByRole('row').should('have.length', 6);
                cy.get('[id="dedicated-1"]').should('be.enabled');
                cy.get('[id="dedicated-2"]').should('be.enabled');
                cy.get('[aria-label="dedicated-3 - This plan has limited deployment availability."]');
                cy.get('[id="dedicated-3"]').should('be.disabled');
                cy.get('[id="g6-dedicated-64"]').should('be.disabled');
                cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
            });
        });
        // Shared CPU tab
        // Should have no notices
        // Should contain 3 plans (4 rows including the header row)
        // Should have 1 disabled plan
        // Should have one tooltip for the disabled plan
        cy.findByText('Shared CPU').click();
        cy.get(linodePlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 0);
            cy.findByRole('table', { name: planSelectionTable }).within(function () {
                cy.findAllByRole('row').should('have.length', 4);
                cy.get('[id="shared-1"]').should('be.enabled');
                cy.get('[id="shared-2"]').should('be.enabled');
                cy.get('[id="shared-3"]').should('be.disabled');
                cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 1);
            });
        });
        // High Memory tab
        // Should have the limited availability notice
        // Should contain 1 plan (2 rows including the header row)
        // Should have one disabled plan
        // Should have no tooltip for the disabled plan (more than half disabled plans in the panel)
        cy.findByText('High Memory').click();
        cy.get(linodePlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 1);
            cy.get(notices.limitedAvailability).should('be.visible');
            cy.findByRole('table', { name: planSelectionTable }).within(function () {
                cy.findAllByRole('row').should('have.length', 2);
                cy.get('[id="highmem-1"]').should('be.disabled');
                cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
            });
        });
        // Premium CPU
        // Should have the unavailable notice
        // Only present since we manually inject the 512 plan for it
        // Should contain 1 plan (2 rows including the header row)
        // Should have its whole panel disabled
        // Should not have tooltip for the disabled plan (not needed on disabled panels)
        cy.findByText('Premium CPU').click();
        cy.get(linodePlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 1);
            cy.get(notices.unavailable).should('be.visible');
            cy.findByRole('table', { name: planSelectionTable }).within(function () {
                cy.findAllByRole('row').should('have.length', 2);
                cy.get('[id="g7-premium-64"]').should('be.disabled');
                cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
            });
        });
    });
});
describe('displays kubernetes plans panel based on availability', function () {
    beforeEach(function () {
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, linodes_1.mockGetLinodeTypes)(mockLinodeTypes).as('getLinodeTypes');
        (0, regions_1.mockGetRegionAvailability)(mockRegions[0].id, mockRegionAvailability).as('getRegionAvailability');
    });
    it('displays the proper plans based on the region and types', function () {
        cy.visitWithLogin('/kubernetes/create');
        cy.wait(['@getRegions', '@getLinodeTypes']);
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();
        cy.wait(['@getRegionAvailability']);
        // Dedicated CPU tab
        // Should be selected/open by default
        // Should have the limited availability notice
        // Should contain 5 plans (6 rows including the header row)
        // Should have 3 plans disabled
        // Should have no tooltips for the disabled plans (more than half disabled plans in the panel)
        // All inputs for a row should be enabled if row is enabled (only testing one row in suite)
        // All inputs for a disabled row should be disabled (only testing one row in suite)
        cy.get(k8PlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 1);
            cy.get(notices.limitedAvailability).should('be.visible');
            cy.findByRole('table', { name: planSelectionTable }).within(function () {
                cy.findAllByRole('row').should('have.length', 6);
                cy.get('[data-qa-plan-row="dedicated-1"]').should('not.have.attr', 'disabled');
                cy.get('[data-qa-plan-row="dedicated-2"]').should('not.have.attr', 'disabled');
                cy.get('[data-qa-plan-row="dedicated-3"]').should('have.attr', 'disabled');
                cy.get('[data-qa-plan-row="Dedicated 512 GB"]').should('have.attr', 'disabled');
                cy.get('[data-qa-plan-row="dedicated-3"]').within(function () {
                    cy.get('[data-testid="decrement-button"]').should('be.disabled');
                    cy.get('[data-testid="increment-button"]').should('be.disabled');
                    cy.get('[data-testid="button"]')
                        .should('have.attr', 'aria-label', 'This plan has limited deployment availability.')
                        .should('be.disabled');
                });
                cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
            });
        });
        // Shared CPU tab
        // Should have no notices
        // Should contain 3 plans (4 rows including the header row)
        // Should have 2 disabled plans
        // Should have tooltip for the disabled plan (not more than half disabled plans in the panel)
        cy.findByText('Shared CPU').click();
        cy.get(k8PlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 0);
            cy.findByRole('table', { name: planSelectionTable }).within(function () {
                cy.findAllByRole('row').should('have.length', 4);
                cy.get('[data-qa-plan-row="shared-1"]').should('not.have.attr', 'disabled');
                cy.get('[data-qa-plan-row="shared-2"]').should('not.have.attr', 'disabled');
                cy.get('[data-qa-plan-row="shared-3"]').should('have.attr', 'disabled');
                cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 1);
            });
        });
        // High Memory tab
        // Should have the limited availability notice
        // Should contain 1 plan (2 rows including the header row)
        // Should have one disabled plan
        // Should have no tooltip for the disabled plan (more than half disabled plans in the panel)
        cy.findByText('High Memory').click();
        cy.get(k8PlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 1);
            cy.get(notices.limitedAvailability).should('be.visible');
            cy.findByRole('table', { name: planSelectionTable }).within(function () {
                cy.findAllByRole('row').should('have.length', 2);
                cy.get('[data-qa-plan-row="highmem-1"]').should('have.attr', 'disabled');
                cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
            });
        });
        // Premium CPU
        // Should have the unavailable notice
        // Only present since we manually inject the 512 plan for it
        // Should contain 1 plan (2 rows including the header row)
        // Should have its whole panel disabled
        // Should not have tooltip for the disabled plan (not needed on disabled panels)
        cy.findByText('Premium CPU').click();
        cy.get(k8PlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 1);
            cy.get(notices.unavailable).should('be.visible');
            cy.findByRole('table', { name: planSelectionTable }).within(function () {
                cy.findAllByRole('row').should('have.length', 2);
                cy.get('[data-qa-plan-row="Premium 512 GB"]').should('have.attr', 'disabled');
                cy.findAllByTestId('disabled-plan-tooltip').should('have.length', 0);
            });
        });
    });
});
describe('displays specific linode plans for GPU', function () {
    beforeEach(function () {
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, linodes_1.mockGetLinodeTypes)(mockLinodeTypes).as('getLinodeTypes');
        (0, regions_1.mockGetRegionAvailability)(mockRegions[0].id, mockRegionAvailability).as('getRegionAvailability');
        (0, feature_flags_1.mockAppendFeatureFlags)({
            gpuv2: {
                transferBanner: true,
                planDivider: true,
                egressBanner: true,
            },
        }).as('getFeatureFlags');
    });
    it('Should render divided tables when GPU divider enabled', function () {
        cy.visitWithLogin('/linodes/create');
        cy.wait(['@getRegions', '@getLinodeTypes', '@getFeatureFlags']);
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();
        // GPU tab
        // Should display two separate tables
        cy.findByText('GPU').click();
        cy.get(linodePlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 3);
            cy.get(notices.unavailable).should('be.visible');
            cy.findByRole('table', {
                name: 'List of NVIDIA RTX 4000 Ada Plans',
            }).within(function () {
                cy.findByText('NVIDIA RTX 4000 Ada').should('be.visible');
                cy.findAllByRole('row').should('have.length', 2);
                cy.get('[id="gpu-2"]').should('be.disabled');
            });
            cy.findByRole('table', {
                name: 'List of NVIDIA Quadro RTX 6000 Plans',
            }).within(function () {
                cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
                cy.findAllByRole('row').should('have.length', 2);
                cy.get('[id="gpu-1"]').should('be.disabled');
            });
        });
    });
});
describe('displays specific kubernetes plans for GPU', function () {
    beforeEach(function () {
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, linodes_1.mockGetLinodeTypes)(mockLinodeTypes).as('getLinodeTypes');
        (0, regions_1.mockGetRegionAvailability)(mockRegions[0].id, mockRegionAvailability).as('getRegionAvailability');
        (0, feature_flags_1.mockAppendFeatureFlags)({
            gpuv2: {
                transferBanner: true,
                planDivider: true,
                egressBanner: true,
            },
        }).as('getFeatureFlags');
    });
    it('Should render divided tables when GPU divider enabled', function () {
        cy.visitWithLogin('/kubernetes/create');
        cy.wait(['@getRegions', '@getLinodeTypes', '@getFeatureFlags']);
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();
        // GPU tab
        // Should display two separate tables
        cy.findByText('GPU').click();
        cy.get(k8PlansPanel).within(function () {
            cy.findAllByRole('alert').should('have.length', 2);
            cy.get(notices.unavailable).should('be.visible');
            cy.findByRole('table', {
                name: 'List of NVIDIA RTX 4000 Ada Plans',
            }).within(function () {
                cy.findByText('NVIDIA RTX 4000 Ada').should('be.visible');
                cy.findAllByRole('row').should('have.length', 2);
                cy.get('[data-qa-plan-row="gpu-2 Ada"]').should('have.attr', 'disabled');
            });
            cy.findByRole('table', {
                name: 'List of NVIDIA Quadro RTX 6000 Plans',
            }).within(function () {
                cy.findByText('NVIDIA Quadro RTX 6000').should('be.visible');
                cy.findAllByRole('row').should('have.length', 2);
                cy.get('[data-qa-plan-row="gpu-1"]').should('have.attr', 'disabled');
            });
        });
    });
});
describe('Linode Accelerated plans', function () {
    beforeEach(function () {
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, linodes_1.mockGetLinodeTypes)(mockLinodeTypes).as('getLinodeTypes');
        (0, regions_1.mockGetRegionAvailability)(mockRegions[0].id, mockRegionAvailability).as('getRegionAvailability');
    });
    describe('without necessary account capability', function () {
        beforeEach(function () {
            (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
                capabilities: [],
            })).as('getAccount');
            (0, feature_flags_1.mockAppendFeatureFlags)({
                acceleratedPlans: {
                    linodePlans: true,
                    lkePlans: true,
                },
            }).as('getFeatureFlags');
        });
        it('should not render accelerated plans for linodes', function () {
            cy.visitWithLogin('/linodes/create');
            cy.wait([
                '@getRegions',
                '@getLinodeTypes',
                '@getAccount',
                '@getFeatureFlags',
            ]);
            cy.findByText('Accelerated').should('not.exist');
        });
        it('should not render accelerated plans for kubernetes', function () {
            cy.visitWithLogin('/kubernetes/create');
            cy.wait([
                '@getRegions',
                '@getLinodeTypes',
                '@getAccount',
                '@getFeatureFlags',
            ]);
            cy.findByText('Accelerated').should('not.exist');
        });
    });
    describe('with necessary account capability', function () {
        beforeEach(function () {
            (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
                capabilities: ['NETINT Quadra T1U'],
            })).as('getAccount');
        });
        describe('Linodes plans panel', function () {
            it('should render Accelerated plans when the feature flag is on', function () {
                (0, feature_flags_1.mockAppendFeatureFlags)({
                    acceleratedPlans: {
                        linodePlans: true,
                        lkePlans: false,
                    },
                }).as('getFeatureFlags');
                cy.visitWithLogin('/linodes/create');
                cy.wait([
                    '@getRegions',
                    '@getLinodeTypes',
                    '@getAccount',
                    '@getFeatureFlags',
                ]);
                ui_1.ui.regionSelect.find().click();
                ui_1.ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();
                cy.findByText('Accelerated').click();
                cy.get(linodePlansPanel).within(function () {
                    cy.findAllByRole('alert').should('have.length', 2);
                    cy.findByRole('table', {
                        name: 'List of Linode Plans',
                    }).within(function () {
                        cy.findByText('NETINT Quadra T1U').should('be.visible');
                        cy.findAllByRole('row').should('have.length', 2);
                        cy.get('[id="accelerated-1"]').should('be.disabled');
                    });
                });
            });
            it('should not render Accelerated plans when the feature flag is off', function () {
                (0, feature_flags_1.mockAppendFeatureFlags)({
                    acceleratedPlans: {
                        linodePlans: false,
                        lkePlans: false,
                    },
                }).as('getFeatureFlags');
                cy.visitWithLogin('/linodes/create');
                cy.wait([
                    '@getRegions',
                    '@getLinodeTypes',
                    '@getAccount',
                    '@getFeatureFlags',
                ]);
                // Confirms Accelerated tab does not show up for linodes
                cy.findByText('Accelerated').should('not.exist');
            });
        });
        describe('kubernetes plans panel', function () {
            it('should render Accelerated plans when the feature flag is on', function () {
                (0, feature_flags_1.mockAppendFeatureFlags)({
                    acceleratedPlans: {
                        linodePlans: false,
                        lkePlans: true,
                    },
                }).as('getFeatureFlags');
                cy.visitWithLogin('/kubernetes/create');
                cy.wait([
                    '@getRegions',
                    '@getLinodeTypes',
                    '@getAccount',
                    '@getFeatureFlags',
                ]);
                ui_1.ui.regionSelect.find().click();
                ui_1.ui.regionSelect.findItemByRegionLabel(mockRegions[0].label).click();
                cy.wait(['@getRegionAvailability']);
                cy.findByText('Accelerated').click();
                cy.get(k8PlansPanel).within(function () {
                    cy.findAllByRole('alert').should('have.length', 2);
                    cy.findByRole('table', { name: planSelectionTable }).within(function () {
                        cy.findAllByRole('row').should('have.length', 2);
                        cy.get('[data-qa-plan-row="accelerated-1"]').should('be.visible');
                    });
                });
            });
            it('should not render Accelerated plans when the feature flag is off', function () {
                (0, feature_flags_1.mockAppendFeatureFlags)({
                    acceleratedPlans: {
                        linodePlans: false,
                        lkePlans: false,
                    },
                }).as('getFeatureFlags');
                cy.visitWithLogin('/kubernetes/create');
                cy.wait([
                    '@getRegions',
                    '@getLinodeTypes',
                    '@getAccount',
                    '@getFeatureFlags',
                ]);
                // Confirms Accelerated tab does not show up for LKE clusters
                cy.findByText('Accelerated').should('not.exist');
            });
        });
    });
});
