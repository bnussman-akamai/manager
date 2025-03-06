"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var factories_1 = require("@src/factories");
var regions_1 = require("support/intercepts/regions");
var regions_2 = require("support/util/regions");
var mockRegions = [
    (0, regions_2.extendRegion)(factories_1.regionFactory.build({
        capabilities: ['Linodes'],
        country: 'uk',
        id: 'eu-west',
        label: 'London, UK',
    })),
    (0, regions_2.extendRegion)(factories_1.regionFactory.build({
        capabilities: ['Linodes'],
        country: 'sg',
        id: 'ap-south',
        label: 'Singapore, SG',
    })),
    (0, regions_2.extendRegion)(factories_1.regionFactory.build({
        capabilities: ['Linodes'],
        id: 'us-east',
        label: 'Newark, NJ',
    })),
    (0, regions_2.extendRegion)(factories_1.regionFactory.build({
        capabilities: ['Linodes'],
        id: 'us-central',
        label: 'Dallas, TX',
    })),
];
describe('Linode Create Region Select', function () {
    /*
     * Region select test.
     *
     * TODO: Cypress
     * Move this to cypress component testing once the setup is complete - see https://github.com/linode/manager/pull/10134
     *
     * - Confirms that region select dropdown is visible and interactive.
     * - Confirms that region select dropdown is populated with expected regions.
     * - Confirms that region select dropdown is sorted alphabetically by region, with North America first.
     * - Confirms that region select dropdown is populated with expected DCs, sorted alphabetically.
     */
    it('region select', function () {
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        cy.visitWithLogin('linodes/create');
        cy.wait('@getRegions');
        // Confirm that region select dropdown is visible and interactive.
        ui_1.ui.regionSelect.find().click();
        cy.get('[data-qa-autocomplete-popper="true"]').should('be.visible');
        // Confirm that region select dropdown are grouped by region,
        // sorted alphabetically, with North America first.
        cy.get('.MuiAutocomplete-groupLabel')
            .should('have.length', 3)
            .should(function (group) {
            expect(group[0]).to.contain('North America');
            expect(group[1]).to.contain('Asia');
            expect(group[2]).to.contain('Europe');
        });
        // Confirm that region select dropdown is populated with expected regions, sorted alphabetically.
        cy.get('[data-qa-option]').should('exist').should('have.length', 4);
        mockRegions.forEach(function (region) {
            cy.get('[data-qa-option]').contains(region.label);
        });
        // Select an option
        cy.findByTestId('eu-west').click();
        // Confirm the popper is closed
        cy.get('[data-qa-autocomplete-popper="true"]').should('not.exist');
        // Confirm that the selected region is displayed in the input field.
        cy.findByLabelText('Region').should('have.value', 'UK, London (eu-west)');
        // Confirm that selecting a valid region updates the Plan Selection panel.
        expect(cy.get('[data-testid="table-row-empty"]').should('not.exist'));
    });
});
