"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var authentication_1 = require("support/api/authentication");
var domains_1 = require("support/intercepts/domains");
var ui_1 = require("support/ui");
var downloads_1 = require("support/util/downloads");
var random_1 = require("support/util/random");
(0, authentication_1.authenticate)();
describe('Download a Zone file', function () {
    /*
     * - Clicks "Import A Zone" button and confirms operation.
     * - Confirms that Domain won't be imported when the domain is empty or invalid.
     * - Confirms that Domain won't be imported when the name server is empty or invalid.
     * - Confirms that Domain exists after imported operation.
     */
    it('downloads a zone in the domain page', function () {
        var mockDomain = factories_1.domainFactory.build({
            domain: (0, random_1.randomDomainName)(),
            group: 'test-group',
            id: 123,
        });
        var mockDomainRecords = factories_1.domainRecordFactory.build();
        var mockDomainZoneFile = factories_1.domainZoneFileFactory.build();
        var mockZoneFileContents = mockDomainZoneFile.zone_file.join('\n');
        cy.visitWithLogin('/domains');
        ui_1.ui.button
            .findByTitle('Import a Zone')
            .should('be.visible')
            .should('be.enabled')
            .click();
        (0, domains_1.mockGetDomains)([mockDomain]).as('getDomains');
        cy.visitWithLogin('/domains');
        cy.wait('@getDomains');
        (0, domains_1.mockGetDomain)(mockDomain.id, mockDomain).as('getDomain');
        (0, domains_1.mockGetDomainRecords)([mockDomainRecords]).as('getDomainRecords');
        cy.findByText(mockDomain.domain).should('be.visible').should('be.visible');
        cy.findByText(mockDomain.domain).click();
        cy.wait('@getDomain');
        cy.wait('@getDomainRecords');
        (0, domains_1.mockGetDomainZoneFile)(mockDomain.id, mockDomainZoneFile).as('getDomainZoneFile');
        ui_1.ui.button
            .findByTitle('Download DNS Zone File')
            .should('be.visible')
            .click();
        cy.wait('@getDomainZoneFile');
        (0, downloads_1.readDownload)("".concat(mockDomain.domain, ".txt")).should('eq', mockZoneFileContents);
    });
});
