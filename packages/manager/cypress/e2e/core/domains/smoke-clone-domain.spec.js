"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var domains_1 = require("@linode/api-v4/lib/domains");
var factories_1 = require("@src/factories");
var authentication_1 = require("support/api/authentication");
var domains_2 = require("support/constants/domains");
var domains_3 = require("support/intercepts/domains");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var random_1 = require("support/util/random");
(0, authentication_1.authenticate)();
describe('Clone a Domain', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('domains');
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Clicks "Clone" action menu item for domain but cancels operation.
     * - Clicks "Clone" action menu item for domain and confirms operation.
     * - Confirms that a "Domain is not valid." error is yielded when entering an invalid domain name.
     * - Confirms that the user is redirected to the new Domain's details page after cloning.
     * - Confirms that domain is still in landing page list after canceled operation.
     * - Confirms that cloned domains contain the same records as the original Domain.
     */
    it('clones a domain', function () {
        var domainRequest = factories_1.domainFactory.build({
            domain: (0, random_1.randomDomainName)(),
            group: 'test-group',
        });
        var invalidDomainName = 'invalid-domain-name';
        var clonedDomainName = (0, random_1.randomDomainName)();
        var domainRecords = (0, domains_2.createDomainRecords)();
        cy.defer(function () { return (0, domains_1.createDomain)(domainRequest); }, 'creating domain').then(function (domain) {
            // Add records to the domain.
            cy.visitWithLogin("/domains/".concat(domain.id));
            domainRecords.forEach(function (rec) {
                (0, domains_3.interceptCreateDomainRecord)().as('apiCreateRecord');
                cy.findByText(rec.name).click();
                rec.fields.forEach(function (f) {
                    cy.get(f.name).click();
                    cy.focused().type(f.value);
                });
                cy.findByText('Save').click();
                cy.wait('@apiCreateRecord');
            });
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
            ui_1.ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();
            // Cancel cloning when prompted to confirm.
            ui_1.ui.drawer
                .findByTitle("Clone Domain")
                .should('be.visible')
                .within(function () {
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Cancel')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that no new domain is added and initiate cloning again.
            cy.findByText(domain.domain)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                ui_1.ui.actionMenu
                    .findByTitle("Action menu for Domain ".concat(domain.domain))
                    .should('be.visible')
                    .click();
            });
            ui_1.ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();
            // Confirm cloning.
            ui_1.ui.drawer
                .findByTitle("Clone Domain")
                .should('be.visible')
                .within(function () {
                // The button should be disabled before confirming the correct domain
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Create Domain')
                    .should('be.visible')
                    .should('be.disabled');
                // Confirm that an error is displayed when entering an invalid domain name
                cy.findByLabelText('New Domain').click();
                cy.focused().type(invalidDomainName);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Create Domain')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.findByText('Domain is not valid.').should('be.visible');
                cy.findByLabelText('New Domain').click();
                cy.focused().clear();
                cy.focused().type(clonedDomainName);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Create Domain')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // After cloning a Domain, the user is redirected to the new Domain's details page
            cy.url().should('match', /\/domains\/\d+$/);
            // Confirm that domain is cloned and cloned domains contain the same records as the original Domain.
            cy.visitWithLogin('/domains');
            cy.findByText(domain.domain).should('be.visible');
            cy.findByText(clonedDomainName).should('be.visible').click();
            domainRecords.forEach(function (rec) {
                cy.get("[aria-label=\"".concat(rec.tableAriaLabel, "\"]")).within(function (_table) {
                    rec.fields.forEach(function (f) {
                        if (f.skipCheck) {
                            return;
                        }
                        cy.findByText(f.value, { exact: !f.approximate });
                    });
                });
            });
        });
    });
});
