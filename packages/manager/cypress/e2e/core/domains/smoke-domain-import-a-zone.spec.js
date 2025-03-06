"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var authentication_1 = require("support/api/authentication");
var domains_1 = require("support/intercepts/domains");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
(0, authentication_1.authenticate)();
describe('Import a Zone', function () {
    /*
     * - Clicks "Import A Zone" button and confirms operation.
     * - Confirms that Domain won't be imported when the domain is empty or invalid.
     * - Confirms that Domain won't be imported when the name server is empty or invalid.
     * - Confirms that Domain exists after imported operation.
     */
    it('imports a zone in the domain page', function () {
        var zone = {
            domain: (0, random_1.randomDomainName)(),
            remote_nameserver: (0, random_1.randomIp)(),
        };
        var mockDomain = factories_1.domainFactory.build({
            domain: zone.domain,
            group: 'test-group',
        });
        (0, domains_1.mockGetDomains)([mockDomain]).as('getDomains');
        cy.visitWithLogin('/domains');
        cy.wait('@getDomains');
        ui_1.ui.button
            .findByTitle('Import a Zone')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle('Import a Zone')
            .should('be.visible')
            .within(function () {
            // The button should be disabled before providing any values
            ui_1.ui.buttonGroup
                .findButtonByTitle('Import')
                .should('be.visible')
                .should('be.disabled');
            // Verify only filling out Domain cannot import
            cy.findByLabelText('Domain').click();
            cy.focused().clear();
            cy.focused().type(zone.domain);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Import')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Remote nameserver is required.');
            // Verify invalid domain cannot import
            cy.findByLabelText('Domain').click();
            cy.focused().clear();
            cy.focused().type('1');
            cy.findByLabelText('Remote Nameserver').click();
            cy.focused().clear();
            cy.focused().type(zone.remote_nameserver);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Import')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Domain is not valid.');
            // Verify only filling out RemoteNameserver cannot import
            cy.findByLabelText('Domain').click();
            cy.focused().clear();
            cy.findByLabelText('Remote Nameserver').click();
            cy.focused().clear();
            cy.focused().type(zone.remote_nameserver);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Import')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Domain is required.');
            // Verify invalid remote nameserver cannot import
            cy.findByLabelText('Domain').click();
            cy.focused().clear();
            cy.focused().type(zone.domain);
            cy.findByLabelText('Remote Nameserver').click();
            cy.focused().clear();
            cy.focused().type('1');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Import')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText("The nameserver '1' is not valid.");
            // Fill out and import the zone.
            (0, domains_1.mockImportDomain)(mockDomain).as('importDomain');
            (0, domains_1.mockGetDomains)([mockDomain]).as('getDomains');
            cy.findByLabelText('Domain').click();
            cy.focused().clear();
            cy.focused().type(zone.domain);
            cy.findByLabelText('Remote Nameserver').click();
            cy.focused().clear();
            cy.focused().type(zone.remote_nameserver);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Import')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that zone is imported.
        cy.wait('@importDomain');
        cy.visitWithLogin('/domains');
        cy.wait('@getDomains');
        cy.findByText(zone.domain).should('be.visible');
    });
});
