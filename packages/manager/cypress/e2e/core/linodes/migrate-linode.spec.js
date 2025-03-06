"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authentication_1 = require("support/api/authentication");
var linodes_1 = require("support/intercepts/linodes");
var ui_1 = require("support/ui");
var intercepts_1 = require("support/util/intercepts");
var factories_1 = require("@src/factories");
var linodes_2 = require("support/intercepts/linodes");
var regions_1 = require("support/util/regions");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var linodes_3 = require("support/intercepts/linodes");
var factories_2 = require("@src/factories");
(0, authentication_1.authenticate)();
describe('Migrate linodes', function () {
    /*
     * - Confirms that flow works as expected during Linode migration between two regions without pricing changes.
     */
    it('can migrate linodes', function () {
        var initialRegion = (0, regions_1.getRegionById)('us-west');
        var newRegion = (0, regions_1.getRegionById)('us-east');
        var mockLinode = factories_1.linodeFactory.build({
            region: initialRegion.id,
        });
        var mockLinodeDisks = factories_2.linodeDiskFactory.buildList(3);
        (0, linodes_2.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        // Mock request to get Linode volumes and disks
        (0, linodes_1.mockGetLinodeDisks)(mockLinode.id, mockLinodeDisks).as('getLinodeDisks');
        (0, linodes_1.mockGetLinodeVolumes)(mockLinode.id, []).as('getLinodeVolumes');
        cy.visitWithLogin("/linodes/".concat(mockLinode.id, "?migrate=true"));
        cy.wait(['@getLinode', '@getLinodeDisks', '@getLinodeVolumes']);
        ui_1.ui.button.findByTitle('Enter Migration Queue').should('be.disabled');
        cy.findByText("".concat(initialRegion.label)).should('be.visible');
        cy.get('[data-qa-checked="false"]').click();
        cy.findByText("North America: ".concat(initialRegion.label)).should('be.visible');
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionLabel(newRegion.label).click();
        // intercept migration request and stub it, respond with 200
        cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(mockLinode.id, "/migrate")), {
            statusCode: 200,
        }).as('migrateReq');
        ui_1.ui.button
            .findByTitle('Enter Migration Queue')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@migrateReq').its('response.statusCode').should('eq', 200);
    });
    /*
     * - Confirms DC-specific pricing UI flow works as expected during Linode migration.
     * - Confirms that pricing comparison is shown in "Region" section when migration occurs in DCs with different price structures.
     */
    it('shows DC-specific pricing information when migrating linodes between differently priced DCs', function () {
        var initialRegion = (0, regions_1.getRegionById)('us-west');
        var newRegion = (0, regions_1.getRegionById)('us-east');
        var mockLinode = factories_1.linodeFactory.build({
            region: initialRegion.id,
            type: dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id,
        });
        var mockLinodeDisks = factories_2.linodeDiskFactory.buildList(3);
        (0, linodes_2.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        // Mock request to get Linode volumes and disks
        (0, linodes_1.mockGetLinodeDisks)(mockLinode.id, mockLinodeDisks).as('getLinodeDisks');
        (0, linodes_1.mockGetLinodeVolumes)(mockLinode.id, []).as('getLinodeVolumes');
        // Mock requests to get get individual types.
        (0, linodes_3.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[0]);
        (0, linodes_3.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[1]);
        cy.visitWithLogin("/linodes/".concat(mockLinode.id, "?migrate=true"));
        cy.wait(['@getLinode', '@getLinodeDisks', '@getLinodeVolumes']);
        ui_1.ui.button.findByTitle('Enter Migration Queue').should('be.disabled');
        cy.findByText("".concat(initialRegion.label)).should('be.visible');
        cy.get('[data-qa-checked="false"]').click();
        cy.findByText("North America: ".concat(initialRegion.label)).should('be.visible');
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionLabel(newRegion.label).click();
        cy.findByText(dc_specific_pricing_1.dcPricingCurrentPriceLabel).should('be.visible');
        var currentPrice = dc_specific_pricing_1.dcPricingMockLinodeTypes[0].region_prices.find(function (regionPrice) { return regionPrice.id === initialRegion.id; });
        var currentBackupPrice = dc_specific_pricing_1.dcPricingMockLinodeTypes[0].addons.backups.region_prices.find(function (regionPrice) { return regionPrice.id === initialRegion.id; });
        cy.get('[data-testid="current-price-panel"]').within(function () {
            cy.findByText("$".concat(currentPrice.monthly.toFixed(2))).should('be.visible');
            cy.findByText("$".concat(currentPrice.hourly)).should('be.visible');
            cy.findByText("$".concat(currentBackupPrice.monthly)).should('be.visible');
        });
        cy.findByText(dc_specific_pricing_1.dcPricingNewPriceLabel).should('be.visible');
        var newPrice = dc_specific_pricing_1.dcPricingMockLinodeTypes[1].region_prices.find(function (linodeType) { return linodeType.id === newRegion.id; });
        var newBackupPrice = dc_specific_pricing_1.dcPricingMockLinodeTypes[1].addons.backups.region_prices.find(function (regionPrice) { return regionPrice.id === newRegion.id; });
        cy.get('[data-testid="new-price-panel"]').within(function () {
            cy.findByText("$".concat(newPrice.monthly.toFixed(2))).should('be.visible');
            cy.findByText("$".concat(newPrice.hourly)).should('be.visible');
            cy.findByText("$".concat(newBackupPrice.monthly)).should('be.visible');
        });
        // intercept migration request and stub it, respond with 200
        (0, linodes_1.mockMigrateLinode)(mockLinode.id).as('migrateReq');
        ui_1.ui.button
            .findByTitle('Enter Migration Queue')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@migrateReq').its('response.statusCode').should('eq', 200);
    });
    /*
     * - Confirms DC-specific pricing UI flow works as expected during Linode migration.
     * - Confirms that pricing comparison is not shown in "Region" section if migration occurs in a DC with the same price structure.
     */
    it('shows DC-specific pricing information when migrating linodes to similarly priced DCs', function () {
        var initialRegion = (0, regions_1.getRegionById)('eu-central');
        var newRegion = (0, regions_1.getRegionById)('us-central');
        var mockLinode = factories_1.linodeFactory.build({
            region: initialRegion.id,
            type: dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id,
        });
        var mockLinodeDisks = factories_2.linodeDiskFactory.buildList(3);
        (0, linodes_2.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        // Mock request to get Linode volumes and disks
        (0, linodes_1.mockGetLinodeDisks)(mockLinode.id, mockLinodeDisks).as('getLinodeDisks');
        (0, linodes_1.mockGetLinodeVolumes)(mockLinode.id, []).as('getLinodeVolumes');
        // Mock requests to get individual types.
        (0, linodes_3.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[0]);
        (0, linodes_3.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[1]);
        cy.visitWithLogin("/linodes/".concat(mockLinode.id, "?migrate=true"));
        cy.wait(['@getLinode', '@getLinodeDisks', '@getLinodeVolumes']);
        ui_1.ui.button.findByTitle('Enter Migration Queue').should('be.disabled');
        cy.findByText("".concat(initialRegion.label)).should('be.visible');
        cy.get('[data-qa-checked="false"]').click();
        // Confirm that user cannot select the Linode's current DC when migrating.
        // TODO Consider refactoring this flow into its own test.
        ui_1.ui.autocomplete.findByLabel('New Region').click().type(initialRegion.id);
        ui_1.ui.autocompletePopper.find().within(function () {
            cy.contains(initialRegion.id).should('not.exist');
            cy.findByText('No results').should('be.visible');
        });
        // Confirm that DC pricing information does not show up
        cy.findByText(dc_specific_pricing_1.dcPricingCurrentPriceLabel).should('not.exist');
        cy.get('[data-testid="current-price-panel"]').should('not.exist');
        cy.findByText(dc_specific_pricing_1.dcPricingNewPriceLabel).should('not.exist');
        cy.get('[data-testid="new-price-panel"]').should('not.exist');
        // Change region selection to another region with the same price structure.
        ui_1.ui.regionSelect.find().click().clear().type("".concat(newRegion.label, "{enter}"));
        // Confirm that DC pricing information still does not show up.
        cy.findByText(dc_specific_pricing_1.dcPricingCurrentPriceLabel).should('not.exist');
        cy.get('[data-testid="current-price-panel"]').should('not.exist');
        cy.findByText(dc_specific_pricing_1.dcPricingNewPriceLabel).should('not.exist');
        cy.get('[data-testid="new-price-panel"]').should('not.exist');
        // Confirm that migration queue button is enabled.
        ui_1.ui.button
            .findByTitle('Enter Migration Queue')
            .should('be.visible')
            .should('be.enabled');
    });
});
