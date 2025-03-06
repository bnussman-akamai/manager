"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authentication_1 = require("support/api/authentication");
var factories_1 = require("src/factories");
var stackscripts_1 = require("support/intercepts/stackscripts");
var ui_1 = require("support/ui");
(0, authentication_1.authenticate)();
describe('Delete stackscripts', function () {
    /*
     * - Confirms StackScript deletion UI flow using mocked API data.
     * - Confirms that the stackscript item still exist when cancelling the delete operation.
     * - Confirms that the stackscript item can be deleted successfully.
     * - Confirms that "Automate Deployment with StackScripts!" welcome page appears when user has no StackScript.
     */
    it('deletes the stackscripts', function () {
        var stackScripts = factories_1.stackScriptFactory.buildList(2, {
            is_public: false,
        });
        (0, stackscripts_1.mockGetStackScripts)(stackScripts).as('getStackScripts');
        cy.visitWithLogin('/stackscripts/account');
        cy.wait('@getStackScripts');
        // Do nothing when cancelling
        cy.get("[data-qa-table-row=\"".concat(stackScripts[0].label, "\"]"))
            .closest('tr')
            .within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for StackScript ".concat(stackScripts[0].label))
                .should('be.visible')
                .click();
        });
        ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle("Delete StackScript ".concat(stackScripts[0].label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.button.findByTitle('Cancel').should('be.visible').click();
        });
        cy.findByText(stackScripts[0].label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(stackScripts[0].description).should('be.visible');
        });
        // The StackScript is deleted successfully.
        cy.get("[data-qa-table-row=\"".concat(stackScripts[0].label, "\"]"))
            .closest('tr')
            .within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for StackScript ".concat(stackScripts[0].label))
                .should('be.visible')
                .click();
        });
        (0, stackscripts_1.mockDeleteStackScript)(stackScripts[0].id).as('deleteStackScript');
        (0, stackscripts_1.mockGetStackScripts)([stackScripts[1]]).as('getUpdatedStackScripts');
        ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle("Delete StackScript ".concat(stackScripts[0].label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete StackScript')
                .should('be.visible')
                .click();
        });
        cy.wait('@deleteStackScript');
        cy.wait('@getUpdatedStackScripts');
        cy.findByText(stackScripts[0].label).should('not.exist');
        // The "Automate Deployment with StackScripts!" welcome page appears when no StackScript exists.
        cy.get("[data-qa-table-row=\"".concat(stackScripts[1].label, "\"]"))
            .closest('tr')
            .within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for StackScript ".concat(stackScripts[1].label))
                .should('be.visible')
                .click();
        });
        (0, stackscripts_1.mockDeleteStackScript)(stackScripts[1].id).as('deleteStackScript');
        (0, stackscripts_1.mockGetStackScripts)([]).as('getUpdatedStackScripts');
        ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle("Delete StackScript ".concat(stackScripts[1].label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete StackScript')
                .should('be.visible')
                .click();
        });
        cy.wait('@deleteStackScript');
        cy.wait('@getUpdatedStackScripts');
        cy.findByText(stackScripts[1].label).should('not.exist');
        cy.findByText('Automate deployment scripts').should('be.visible');
    });
});
