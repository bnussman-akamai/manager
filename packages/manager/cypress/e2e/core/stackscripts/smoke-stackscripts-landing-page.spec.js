"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authentication_1 = require("support/api/authentication");
var factories_1 = require("src/factories");
var stackscripts_1 = require("support/intercepts/stackscripts");
var ui_1 = require("support/ui");
(0, authentication_1.authenticate)();
describe('Display stackscripts', function () {
    /*
     * - Displays welcome message in the landing page.
     * - Confirms that "Automate Deployment with StackScripts!" welcome page appears when user has no StackScripts.
     */
    it('displays the correct welcome message in landing page', function () {
        (0, stackscripts_1.mockGetStackScripts)([]).as('getStackScripts');
        cy.visitWithLogin('/stackscripts/account');
        cy.wait('@getStackScripts');
        cy.findByText('Automate deployment scripts').should('be.visible');
        cy.get('[data-qa-placeholder-container="resources-section"]')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Create StackScript')
                .should('be.visible')
                .should('be.enabled');
        });
    });
    /*
     * - Displays Account StackScripts in the landing page.
     * - Confirms that all the StackScripts are shown as expected.
     */
    it('displays Account StackScripts in landing page', function () {
        var stackScripts = factories_1.stackScriptFactory.buildList(2);
        (0, stackscripts_1.mockGetStackScripts)(stackScripts).as('getStackScripts');
        cy.visitWithLogin('/stackscripts/account');
        cy.wait('@getStackScripts');
        stackScripts.forEach(function (stackScript) {
            cy.get("[data-qa-table-row=\"".concat(stackScript.label, "\"]"))
                .closest('tr')
                .within(function () {
                cy.findByText(stackScript.deployments_total).should('be.visible');
                cy.findByText("".concat(stackScript.updated.split('T')[0])).should('be.visible');
                if (stackScript.is_public) {
                    cy.findByText('Public').should('be.visible');
                }
            });
        });
    });
});
