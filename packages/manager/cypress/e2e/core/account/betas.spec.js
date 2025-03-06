"use strict";
/**
 * @file Integration tests for Betas landing page.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var feature_flags_1 = require("support/intercepts/feature-flags");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
// TODO Delete feature flag mocks when feature flag is removed.
beforeEach(function () {
    cy.tag('method:e2e');
});
describe('Betas landing page', function () {
    /*
     * - Confirms that Betas nav item is present when feature is enabled.
     * - Confirms that Betas nav item redirects to Betas landing page.
     * - Confirms that Betas landing page is accessible.
     */
    it('can navigate to Betas landing page', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            selfServeBetas: true,
        }).as('getFeatureFlags');
        // Ensure that the Primary Nav is open
        (0, profile_1.mockGetUserPreferences)({ desktop_sidebar_open: false }).as('getPreferences');
        cy.visitWithLogin('/linodes');
        cy.wait('@getFeatureFlags');
        ui_1.ui.nav
            .findItemByTitle('Betas')
            .scrollIntoView()
            .should('be.visible')
            .click();
        cy.url().should('endWith', '/betas');
        ui_1.ui.heading.findByText('Betas').should('be.visible');
        cy.findByText('Available & Upcoming Betas').should('be.visible');
        cy.findByText('Beta Participation History').should('be.visible');
    });
    /*
     * - Confirms that Betas nav item is not present when feature is disabled.
     * - Confirms that Betas landing page is not accessible when feature is disabled.
     */
    it('cannot access Betas landing page when feature is disabled', function () {
        // TODO Delete this test when betas feature flag is removed from codebase.
        (0, feature_flags_1.mockAppendFeatureFlags)({
            selfServeBetas: false,
        }).as('getFeatureFlags');
        cy.visitWithLogin('/betas');
        cy.wait('@getFeatureFlags');
        cy.findByText('Not Found').should('be.visible');
        ui_1.ui.nav.find().within(function () {
            cy.findByText('Betas').should('not.exist');
        });
    });
});
