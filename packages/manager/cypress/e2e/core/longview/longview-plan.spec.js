"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var authentication_1 = require("support/api/authentication");
var longview_1 = require("support/intercepts/longview");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
(0, authentication_1.authenticate)();
describe('longview plan', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes', 'longview-clients']);
    });
    /*
     * - Tests Longview change plan end-to-end using mock API data.
     * - Confirm UI flow when a user changes their Longview plan.
     */
    it('can change longview plan', function () {
        var newPlan = factories_1.longviewActivePlanFactory.build();
        (0, longview_1.mockGetLongviewPlan)({}).as('getLongviewPlan');
        cy.visitWithLogin('/longview');
        cy.wait('@getLongviewPlan');
        // Confirms that Longview Plan Details tab is visible on the page.
        cy.findByText('Plan Details').should('be.visible').click();
        // Confirms that Longview current plan is visible and enabled by default.
        cy.findByTestId('lv-sub-radio-longview-free').should('be.enabled');
        cy.findByTestId('current-plan-longview-free').should('be.visible');
        ui_1.ui.button
            .findByTitle('Change Plan')
            .should('be.visible')
            .should('be.disabled');
        (0, longview_1.mockUpdateLongviewPlan)(newPlan).as('updateLongviewPlan');
        // Confirms that Longview plan can be changed.
        cy.findByTestId('lv-sub-table-row-longview-3').click();
        ui_1.ui.button
            .findByTitle('Change Plan')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirms the Longview plan details shown correctly after plan changed
        cy.wait('@updateLongviewPlan');
        cy.findByText('Plan updated successfully.').should('be.visible');
        cy.findByTestId('lv-sub-table-row-longview-3').should('be.enabled');
        cy.findByTestId('current-plan-longview-3').should('be.visible');
        ui_1.ui.button
            .findByTitle('Change Plan')
            .should('be.visible')
            .should('be.disabled');
    });
});
