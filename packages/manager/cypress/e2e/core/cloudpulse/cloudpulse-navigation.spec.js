"use strict";
/**
 * @file Integration tests for CloudPulse navigation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var mockAccount = factories_1.accountFactory.build();
describe('CloudPulse  navigation', function () {
    beforeEach(function () {
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
    });
    /*
     * - Confirms that Cloudpulse navigation item is shown when feature flag is enabled.
     * - Confirms that clicking Cloudpulse navigation item directs user to Cloudpulse landing page.
     */
    it('can navigate to Cloudpulse landing page', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            aclp: {
                beta: true,
                enabled: true,
            },
        }).as('getFeatureFlags');
        cy.visitWithLogin('/linodes');
        cy.wait('@getFeatureFlags');
        cy.get('[data-testid="menu-item-Monitor"]').should('be.visible').click();
        cy.url().should('endWith', '/monitor');
    });
    /*
     * - Confirms that Cloudpulse navigation item is not shown when feature flag is disabled.
     */
    it('does not show  Cloudpulse navigation item when feature is disabled', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            aclp: {
                beta: true,
                enabled: false,
            },
        }).as('getFeatureFlags');
        cy.visitWithLogin('/linodes');
        cy.wait('@getFeatureFlags');
        ui_1.ui.nav.find().within(function () {
            cy.get('[data-testid="menu-item-Monitor"]').should('not.exist');
        });
    });
    /*
     * - Confirms that manual navigation to Cloudpulse landing page with feature is disabled displays Not Found to user.
     */
    it('displays Not Found when manually navigating to /cloudpulse with feature flag disabled', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            aclp: {
                beta: true,
                enabled: false,
            },
        }).as('getFeatureFlags');
        cy.visitWithLogin('monitor');
        cy.wait('@getFeatureFlags');
        cy.findByText('Not Found').should('be.visible');
    });
    /*
     * - Confirms that manual navigation to the 'Alert' page on the Cloudpulse landing page is disabled, and users are shown a 'Not Found' message..
     */
    it('should display "Not Found" when navigating to alert definitions with feature flag disabled', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            aclp: { beta: true, enabled: false },
        }).as('getFeatureFlags');
        // Attempt to visit the alert definitions page for a specific alert using a manual URL
        cy.visitWithLogin('monitor/alerts/definitions');
        // Wait for the feature flag to be fetched and applied
        cy.wait('@getFeatureFlags');
        // Assert that the 'Not Found' message is displayed, indicating the user cannot access the page
        cy.findByText('Not Found').should('be.visible');
    });
    /*
     * - Confirms that manual navigation to the 'Alert Definitions Detail' page on the Cloudpulse landing page is disabled, and users are shown a 'Not Found' message..
     */
    it('should display "Not Found" when manually navigating to alert details with feature flag disabled', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            aclp: { beta: true, enabled: false },
        }).as('getFeatureFlags');
        // Attempt to visit the alert detail page for a specific alert using a manual URL
        cy.visitWithLogin('monitor/alerts/definitions/detail/dbaas/20000');
        // Wait for the feature flag to be fetched and applied
        cy.wait('@getFeatureFlags');
        // Assert that the 'Not Found' message is displayed, indicating the user cannot access the page
        cy.findByText('Not Found').should('be.visible');
    });
});
