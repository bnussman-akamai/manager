"use strict";
/**
 * @file Integration tests for Placement Groups navigation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var factories_1 = require("src/factories");
var ui_1 = require("support/ui");
var mockAccount = factories_1.accountFactory.build();
describe('Placement Groups navigation', function () {
    // Mock User Account to include Placement Group capability
    beforeEach(function () {
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
    });
    /*
     * - Confirms that clicking Placement Groups navigation item directs user to Placement Groups landing page.
     */
    it('can navigate to Placement Groups landing page', function () {
        cy.visitWithLogin('/linodes');
        ui_1.ui.nav.findItemByTitle('Placement Groups').should('be.visible').click();
        cy.url().should('endWith', '/placement-groups');
    });
    /*
     * - Confirm navigation patterns to the create drawer
     */
    it('can navigate to a placement group details page', function () {
        cy.visitWithLogin('/placement-groups');
        ui_1.ui.button
            .findByTitle('Create Placement Group')
            .should('be.visible')
            .click();
        cy.url().should('endWith', '/placement-groups/create');
        ui_1.ui.drawer
            .findByTitle('Create Placement Group')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByAttribute('aria-label', 'Close drawer')
                .should('be.visible')
                .click();
        });
        cy.url().should('endWith', '/placement-groups');
    });
});
