"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var authentication_1 = require("support/api/authentication");
var domains_1 = require("support/intercepts/domains");
var cleanup_1 = require("support/util/cleanup");
var random_1 = require("support/util/random");
(0, authentication_1.authenticate)();
describe('Create a Domain', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('domains');
    });
    it('Creates first Domain', function () {
        cy.tag('method:e2e');
        // Mock Domains to modify incoming response.
        var mockDomains = new Array(2).fill(null).map(function (_item, index) {
            return factories_1.domainFactory.build({
                domain: "Domain ".concat(index),
            });
        });
        (0, domains_1.mockGetDomains)(mockDomains).as('getDomains');
        // intercept create Domain request
        (0, domains_1.interceptCreateDomain)().as('createDomain');
        cy.visitWithLogin('/domains');
        cy.wait('@getDomains');
        cy.findByText('Create Domain').click();
        var label = (0, random_1.randomDomainName)();
        cy.get('[id="domain"][data-testid="textfield-input"]')
            .should('be.visible')
            .type(label);
        cy.get('[id="soa-email-address"][data-testid="textfield-input"]')
            .should('be.visible')
            .type('devs@linode.com');
        cy.get('[data-testid="submit"]').click();
        cy.wait('@createDomain');
        cy.get('[data-qa-header]').should('contain', label);
    });
});
