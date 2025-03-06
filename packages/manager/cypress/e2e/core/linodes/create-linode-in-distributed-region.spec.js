"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var feature_flags_1 = require("support/intercepts/feature-flags");
var linodes_1 = require("support/intercepts/linodes");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var pages_1 = require("support/ui/pages");
var random_1 = require("support/util/random");
var regions_2 = require("support/util/regions");
describe('Create Linode in Distributed Region', function () {
    /*
     * - Confirms Linode create flow can be completed with a distributed region
     * - Creates a basic Nanode and confirms interactions succeed and outgoing request contains expected data.
     */
    it('should be able to select a distributed region', function () {
        // create mocks
        var mockRegionOptions = {
            capabilities: ['Linodes', 'Distributed Plans'],
            site_type: 'distributed',
        };
        var mockRegion = (0, regions_2.extendRegion)(factories_1.regionFactory.build(mockRegionOptions));
        var mockLinodeTypes = [
            factories_1.linodeTypeFactory.build({
                id: 'nanode-edge-1',
                label: 'Nanode 1GB',
                class: 'nanode',
            }),
        ];
        var mockLinode = factories_1.linodeFactory.build({
            label: (0, random_1.randomLabel)(),
            region: mockRegion.id,
        });
        var rootPass = (0, random_1.randomString)(32);
        (0, feature_flags_1.mockAppendFeatureFlags)({
            gecko2: {
                enabled: true,
                la: true,
            },
        }).as('getFeatureFlags');
        (0, regions_1.mockGetRegions)([mockRegion]).as('getRegions');
        (0, linodes_1.mockGetLinodeTypes)(mockLinodeTypes).as('getLinodeTypes');
        (0, regions_1.mockGetRegionAvailability)(mockRegion.id, []).as('getRegionAvailability');
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        cy.visitWithLogin('/linodes/create');
        cy.wait(['@getFeatureFlags', '@getRegions', '@getLinodeTypes']);
        // Pick a region from the distributed region list
        cy.findByTestId('region').within(function () {
            ui_1.ui.tabList.findTabByTitle('Distributed').should('be.visible').click();
            pages_1.linodeCreatePage.selectRegionById(mockRegion.id);
        });
        cy.wait(['@getRegionAvailability']);
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 11');
        pages_1.linodeCreatePage.setRootPassword(rootPass);
        cy.get('[data-qa-tp="Linode Plan"]').within(function () {
            cy.findByRole('row', { name: /Nanode 1 GB/i })
                .should('be.visible')
                .click();
        });
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Submit form to create Linode and confirm that outgoing API request
        // contains expected user data.
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var regionId = requestPayload['region'];
            expect(regionId).to.equal(mockLinode.region);
        });
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
    });
});
