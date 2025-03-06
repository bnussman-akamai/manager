"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var feature_flags_1 = require("support/intercepts/feature-flags");
var linodes_1 = require("support/intercepts/linodes");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var pages_1 = require("support/ui/pages");
var random_1 = require("support/util/random");
describe('Create Linode in a Core Region', function () {
    /*
     * - Confirms Linode create flow can be completed with a core region
     * - Creates a basic Nanode and confirms interactions succeed and outgoing request contains expected data.
     */
    it('should be able to select a core region', function () {
        // create mocks
        var mockRegion1 = factories_1.regionFactory.build({
            capabilities: ['Linodes'],
            site_type: 'core',
        });
        var mockRegion2 = factories_1.regionFactory.build({
            capabilities: ['Linodes', 'Distributed Plans'],
            site_type: 'distributed',
        });
        var mockRegions = [mockRegion1, mockRegion2];
        var mockLinode = factories_1.linodeFactory.build({
            label: (0, random_1.randomLabel)(),
            region: mockRegion1.id,
        });
        var rootPass = (0, random_1.randomString)(32);
        (0, feature_flags_1.mockAppendFeatureFlags)({
            gecko2: {
                enabled: true,
                la: true,
            },
        }).as('getFeatureFlags');
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, regions_1.mockGetRegionAvailability)(mockRegion1.id, []).as('getRegionAvailability');
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        cy.visitWithLogin('/linodes/create');
        cy.wait(['@getFeatureFlags', '@getRegions']);
        // Pick a region from the core region list
        cy.findByTestId('region').within(function () {
            ui_1.ui.tabList.findTabByTitle('Core').should('be.visible').click();
            pages_1.linodeCreatePage.selectRegionById(mockRegion1.id);
        });
        cy.wait(['@getRegionAvailability']);
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 11');
        pages_1.linodeCreatePage.setRootPassword(rootPass);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
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
