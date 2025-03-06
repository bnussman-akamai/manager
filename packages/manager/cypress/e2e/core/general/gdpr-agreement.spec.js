"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var account_1 = require("support/intercepts/account");
var linodes_1 = require("support/intercepts/linodes");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var mockRegions = [
    factories_1.regionFactory.build({
        capabilities: ['Linodes'],
        country: 'fr',
        id: 'fr-par',
        label: 'Paris, FR',
    }),
    factories_1.regionFactory.build({
        capabilities: ['Linodes'],
        country: 'sg',
        id: 'ap-south',
        label: 'Singapore, SG',
    }),
    factories_1.regionFactory.build({
        capabilities: ['Linodes'],
        country: 'us',
        id: 'us-east',
        label: 'Newark, NJ',
    }),
    factories_1.regionFactory.build({
        capabilities: ['Linodes'],
        country: 'us',
        id: 'us-central',
        label: 'Dallas, TX',
    }),
    factories_1.regionFactory.build({
        capabilities: ['Linodes'],
        country: 'gb',
        id: 'eu-west',
        label: 'London, UK',
    }),
];
describe('GDPR agreement', function () {
    it('displays the GDPR agreement based on region, if user has not agreed yet', function () {
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, account_1.mockGetAccountAgreements)({
            billing_agreement: false,
            eu_model: false,
            privacy_policy: false,
        }).as('getAgreements');
        cy.visitWithLogin('/linodes/create');
        cy.wait('@getRegions');
        // Paris should have the agreement
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionId('fr-par').click();
        cy.get('[data-testid="eu-agreement-checkbox"]').should('be.visible');
        cy.wait('@getAgreements');
        // London should have the agreement
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionId('eu-west').click();
        cy.get('[data-testid="eu-agreement-checkbox"]').should('be.visible');
        // Newark should not have the agreement
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionId('us-east').click();
        cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');
    });
    it('does not display the GDPR agreement based on any region, if user has already agreed', function () {
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, account_1.mockGetAccountAgreements)({
            billing_agreement: false,
            eu_model: true,
            privacy_policy: false,
        }).as('getAgreements');
        cy.visitWithLogin('/linodes/create');
        cy.wait('@getRegions');
        // Paris should not have the agreement
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionId('fr-par').click();
        cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');
        cy.wait('@getAgreements');
        // London should not have the agreement
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionId('eu-west').click();
        cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');
        // Newark should not have the agreement
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionId('us-east').click();
        cy.get('[data-testid="eu-agreement-checkbox"]').should('not.exist');
    });
    it('needs the agreement checked to submit the form', function () {
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, account_1.mockGetAccountAgreements)({
            billing_agreement: false,
            eu_model: false,
            privacy_policy: false,
        }).as('getAgreements');
        var rootpass = (0, random_1.randomString)(32);
        var linodeLabel = (0, random_1.randomLabel)();
        cy.visitWithLogin('/linodes/create');
        cy.wait(['@getRegions']);
        // Paris should have the agreement
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionId('fr-par').click();
        cy.wait('@getAgreements');
        cy.findByText('Shared CPU').click();
        cy.get('[id="g6-nanode-1"]').click();
        cy.findByLabelText('Linode Label').clear();
        cy.focused().type(linodeLabel);
        cy.findByLabelText('Root Password').type(rootpass);
        cy.get('[data-testid="eu-agreement-checkbox"]')
            .as('euAgreement')
            .scrollIntoView();
        cy.get('@euAgreement').should('be.visible');
        cy.findByText('Create Linode').as('lblCreateLinode').scrollIntoView();
        cy.get('@lblCreateLinode')
            .should('be.enabled')
            .should('be.visible')
            .click();
        cy.findByText('You must agree to the EU agreement to deploy to this region.').should('be.visible');
        // check the agreement
        cy.get('#gdpr-checkbox').click();
        cy.findByText('You must agree to the EU agreement to deploy to this region.').should('not.exist');
        (0, linodes_1.mockCreateLinode)(factories_1.linodeFactory.build()).as('createLinode');
        cy.findByText('Create Linode')
            .should('be.enabled')
            .should('be.visible')
            .click();
        cy.wait('@createLinode');
    });
});
