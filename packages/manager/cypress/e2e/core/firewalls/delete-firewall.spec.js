"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_v4_1 = require("@linode/api-v4");
var authentication_1 = require("support/api/authentication");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var random_1 = require("support/util/random");
var firewalls_1 = require("src/factories/firewalls");
(0, authentication_1.authenticate)();
describe('delete firewall', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('firewalls');
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Clicks "Delete" action menu item for firewall but cancels operation.
     * - Clicks "Delete" action menu item for firewall and confirms operation.
     * - Confirms that firewall is still in landing page list after canceled operation.
     * - Confirms that firewall is removed from landing page list after confirmed operation.
     */
    it('deletes a firewall', function () {
        var firewallRequest = firewalls_1.firewallFactory.build({
            label: (0, random_1.randomLabel)(),
        });
        cy.defer(function () { return (0, api_v4_1.createFirewall)(firewallRequest); }, 'creating firewalls').then(function (firewall) {
            cy.visitWithLogin('/firewalls');
            // Confirm that firewall is listed and initiate deletion.
            cy.findByText(firewall.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('Delete').should('be.visible');
                cy.findByText('Delete').click();
            });
            // Cancel deletion when prompted to confirm.
            ui_1.ui.dialog
                .findByTitle("Delete Firewall ".concat(firewall.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Cancel')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that firewall is still listed and initiate deletion again.
            cy.findByText(firewall.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('Delete').should('be.visible');
                cy.findByText('Delete').click();
            });
            // Confirm deletion.
            ui_1.ui.dialog
                .findByTitle("Delete Firewall ".concat(firewall.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete Firewall')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that firewall is deleted.
            cy.visitWithLogin('/firewalls');
            cy.findByText(firewall.label).should('not.exist');
        });
    });
});
