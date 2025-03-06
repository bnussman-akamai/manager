"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var domains_1 = require("@linode/api-v4/lib/domains");
var factories_1 = require("@src/factories");
var authentication_1 = require("support/api/authentication");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
(0, authentication_1.authenticate)();
beforeEach(function () {
    cy.tag('method:e2e');
});
describe('Delete a Domain', function () {
    /*
     * - Clicks "Delete" action menu item for domain but cancels operation.
     * - Clicks "Delete" action menu item for domain and confirms operation.
     * - Confirms that domain is still in landing page list after canceled operation.
     * - Confirms that domain is removed from landing page list after confirmed operation.
     */
    it('deletes a domain', function () {
        var domainRequest = factories_1.domainFactory.build({
            domain: (0, random_1.randomDomainName)(),
            group: 'test-group',
        });
        cy.defer(function () { return (0, domains_1.createDomain)(domainRequest); }, 'creating domain').then(function (domain) {
            cy.visitWithLogin('/domains');
            // Confirm that domain is listed and initiate deletion.
            cy.findByText(domain.domain)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                ui_1.ui.actionMenu
                    .findByTitle("Action menu for Domain ".concat(domain.domain))
                    .should('be.visible')
                    .click();
            });
            ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
            // Cancel deletion when prompted to confirm.
            ui_1.ui.dialog
                .findByTitle("Delete Domain ".concat(domain.domain, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Cancel')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that domain is still listed and initiate deletion again.
            cy.findByText(domain.domain)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                ui_1.ui.actionMenu
                    .findByTitle("Action menu for Domain ".concat(domain.domain))
                    .should('be.visible')
                    .click();
            });
            ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
            // Confirm deletion.
            ui_1.ui.dialog
                .findByTitle("Delete Domain ".concat(domain.domain, "?"))
                .should('be.visible')
                .within(function () {
                // The button should be disabled before confirming the correct domain
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete Domain')
                    .should('be.visible')
                    .should('be.disabled');
                cy.contains('Domain Name').click();
                cy.focused().type(domain.domain);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete Domain')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that domain is deleted.
            cy.visitWithLogin('/domains');
            cy.findByText(domain.domain).should('not.exist');
        });
    });
});
