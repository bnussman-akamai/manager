"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var factories_1 = require("@src/factories");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var linodes_1 = require("support/intercepts/linodes");
describe('Create Linode with DC-specific pricing', function () {
    /*
     * - Confirms DC-specific pricing UI flow works as expected during Linode creation.
     * - Confirms that pricing docs link is shown in "Region" section.
     * - Confirms that backups pricing is correct when selecting a region with a different price structure.
     */
    it('shows DC-specific pricing information during create flow', function () {
        var linodeLabel = (0, random_1.randomLabel)();
        var initialRegion = (0, regions_1.getRegionById)('us-west');
        var newRegion = (0, regions_1.getRegionById)('us-east');
        var mockLinode = factories_1.linodeFactory.build({
            label: linodeLabel,
            region: initialRegion.id,
            type: dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id,
        });
        var currentPrice = dc_specific_pricing_1.dcPricingMockLinodeTypes[0].region_prices.find(function (regionPrice) { return regionPrice.id === initialRegion.id; });
        var currentBackupPrice = dc_specific_pricing_1.dcPricingMockLinodeTypes[0].addons.backups.region_prices.find(function (regionPrice) { return regionPrice.id === initialRegion.id; });
        var newPrice = dc_specific_pricing_1.dcPricingMockLinodeTypes[1].region_prices.find(function (linodeType) { return linodeType.id === newRegion.id; });
        var newBackupPrice = dc_specific_pricing_1.dcPricingMockLinodeTypes[1].addons.backups.region_prices.find(function (regionPrice) { return regionPrice.id === newRegion.id; });
        // Mock requests to get individual types.
        (0, linodes_1.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[0]);
        (0, linodes_1.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[1]);
        (0, linodes_1.mockGetLinodeTypes)(dc_specific_pricing_1.dcPricingMockLinodeTypes).as('getLinodeTypes');
        // intercept request
        cy.visitWithLogin('/linodes/create');
        cy.wait(['@getLinodeTypes']);
        (0, linodes_1.mockCreateLinode)(mockLinode).as('linodeCreated');
        cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
        ui_1.ui.button.findByTitle('Create Linode').click();
        // A message is shown to instruct users to select a region in order to view plans and prices
        cy.get('[data-qa-tp="Linode Plan"]').should('contain.text', 'Plan is required.');
        cy.get('[data-qa-tp="Linode Plan"]').should('contain.text', dc_specific_pricing_1.dcPricingPlanPlaceholder);
        // Check the 'Backups' add on
        cy.get('[data-testid="backups"]').should('be.visible').click();
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionLabel(initialRegion.label).click();
        cy.findByText('Shared CPU').click();
        cy.get("[id=\"".concat(dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id, "\"]")).click();
        // Confirm that the backup prices are displayed as expected.
        cy.get('[data-qa-add-ons="true"]').within(function () {
            cy.findByText("$".concat(currentBackupPrice.monthly)).should('be.visible');
            cy.findByText('per month').should('be.visible');
        });
        // Confirm that the checkout summary at the bottom of the page reflects the correct price.
        cy.get('[data-qa-linode-create-summary="true"]').within(function () {
            cy.findByText("$".concat(currentPrice.monthly.toFixed(2), "/month")).should('be.visible');
            cy.findByText('Backups').should('be.visible');
            cy.findByText("$".concat(currentBackupPrice.monthly.toFixed(2), "/month")).should('be.visible');
        });
        // Confirm there is a docs link to the pricing page.
        cy.findByText(dc_specific_pricing_1.dcPricingDocsLabel)
            .should('be.visible')
            .should('have.attr', 'href', dc_specific_pricing_1.dcPricingDocsUrl);
        ui_1.ui.regionSelect.find().click().type("".concat(newRegion.label, " {enter}"));
        cy.findByText('Shared CPU').click();
        cy.get("[id=\"".concat(dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id, "\"]")).click();
        // Confirm that the backup prices are displayed as expected.
        cy.get('[data-qa-add-ons="true"]').within(function () {
            cy.findByText("$".concat(newBackupPrice.monthly)).should('be.visible');
            cy.findByText('per month').should('be.visible');
        });
        // Confirms that the summary updates to reflect price changes if the user changes their region and plan selection.
        cy.get('[data-qa-linode-create-summary="true"]').within(function () {
            cy.findByText("$".concat(newPrice.monthly.toFixed(2), "/month")).should('be.visible');
            cy.findByText('Backups').should('be.visible');
            cy.findByText("$".concat(newBackupPrice.monthly.toFixed(2), "/month")).should('be.visible');
        });
    });
});
