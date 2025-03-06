"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var images_1 = require("support/intercepts/images");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var regions_2 = require("support/util/regions");
describe('Manage Image Replicas', function () {
    /**
     * Adds two new regions to an Image (region3 and region4)
     * and removes one existing region (region 1).
     */
    it("updates an Image's regions", function () {
        var regionOptions = {
            site_type: 'core',
            capabilities: ['Object Storage'],
        };
        var region1 = (0, regions_2.extendRegion)(factories_1.regionFactory.build(regionOptions));
        var region2 = (0, regions_2.extendRegion)(factories_1.regionFactory.build(regionOptions));
        var region3 = (0, regions_2.extendRegion)(factories_1.regionFactory.build(regionOptions));
        var region4 = (0, regions_2.extendRegion)(factories_1.regionFactory.build(regionOptions));
        var image = factories_1.imageFactory.build({
            size: 50,
            total_size: 100,
            capabilities: ['distributed-sites'],
            regions: [
                { region: region1.id, status: 'available' },
                { region: region2.id, status: 'available' },
            ],
        });
        (0, regions_1.mockGetRegions)([region1, region2, region3, region4]).as('getRegions');
        (0, images_1.mockGetCustomImages)([image]).as('getImages');
        (0, images_1.mockGetRecoveryImages)([]);
        (0, images_1.mockGetImage)(image.id, image).as('getImage');
        cy.visitWithLogin('/images');
        cy.wait(['@getImages', '@getRegions']);
        cy.findByText(image.label)
            .closest('tr')
            .within(function () {
            // Verify total size is rendered
            cy.findByText("0.1 GB").should('be.visible'); // 100 / 1024 = 0.09765
            // Verify the number of regions is rendered and click it
            cy.findByText("".concat(image.regions.length, " Regions"))
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@getImage');
        // Verify the Manage Replicas drawer opens and contains basic content
        ui_1.ui.drawer
            .findByTitle("Manage Replicas for ".concat(image.label))
            .should('be.visible')
            .within(function () {
            // Verify the Image regions render
            cy.findByText(region1.label).should('be.visible');
            cy.findByText(region2.label).should('be.visible');
            cy.findByText('Image will be replicated in these regions (2)').should('be.visible');
            // Verify the "Save" button is disabled because no changes have been made
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.disabled');
            // Close the Manage Replicas drawer
            ui_1.ui.button
                .findByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.findByText(image.label)
            .closest('tr')
            .within(function () {
            // Open the Image's action menu
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Image ".concat(image.label))
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Click "Manage Replicas" option in the action menu
        ui_1.ui.actionMenuItem
            .findByTitle('Manage Replicas')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Open the Regions Multi-Select
        cy.findByLabelText('Add Regions')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Verify "Select All" shows up as an option
        ui_1.ui.autocompletePopper
            .findByTitle('Select All')
            .should('be.visible')
            .should('be.enabled');
        // Verify region3 shows up as an option and select it
        ui_1.ui.autocompletePopper
            .findByTitle("".concat(region3.label, " (").concat(region3.id, ")"))
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Verify region4 shows up as an option and select it
        ui_1.ui.autocompletePopper
            .findByTitle("".concat(region4.label, " (").concat(region4.id, ")"))
            .should('be.visible')
            .should('be.enabled')
            .click();
        var updatedImage = __assign(__assign({}, image), { total_size: 150, regions: [
                { region: region2.id, status: 'available' },
                { region: region3.id, status: 'pending replication' },
                { region: region4.id, status: 'pending replication' },
            ] });
        // mock the POST /v4/images/:id:regions response
        (0, images_1.mockUpdateImageRegions)(image.id, updatedImage);
        // mock the updated paginated response
        (0, images_1.mockGetCustomImages)([updatedImage]);
        // Click outside of the Region Multi-Select to close the popover
        ui_1.ui.drawer
            .findByTitle("Manage Replicas for ".concat(image.label))
            .click()
            .within(function () {
            // Verify the existing image regions render
            cy.findByText(region1.label).should('be.visible');
            cy.findByText(region2.label).should('be.visible');
            // Verify the newly selected image regions render
            cy.findByText(region3.label).should('be.visible');
            cy.findByText(region4.label).should('be.visible');
            cy.findAllByText('unsaved').should('be.visible');
            // Verify the count is now 3
            cy.findByText('Image will be replicated in these regions (4)').should('be.visible');
            // Verify the "Save" button is enabled because a new region is selected
            ui_1.ui.button.findByTitle('Save').should('be.visible').should('be.enabled');
            // Remove region1
            cy.findByLabelText("Remove ".concat(region1.id))
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Verify the image isn't shown in the list after being removed
            cy.findByText(region1.label).should('not.exist');
            // Verify the count is now 3
            cy.findByText('Image will be replicated in these regions (3)').should('be.visible');
            // Save changes
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.toast.assertMessage("".concat(image.label, "'s regions successfully updated."));
        cy.findByText(image.label)
            .closest('tr')
            .within(function () {
            // Verify the new size is shown
            cy.findByText('0.15 GB'); // 150 / 2014 = 0.1464
            // Verify the new number of regions is shown and click it
            cy.findByText("".concat(updatedImage.regions.length, " Regions"))
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.drawer
            .findByTitle("Manage Replicas for ".concat(image.label))
            .click()
            .within(function () {
            // "Unsaved" regions should transition to "pending replication" because
            // they are now returned by the API
            cy.findAllByText('pending replication').should('be.visible');
            // The save button should be disabled
            ui_1.ui.button.findByTitle('Save').should('be.disabled');
            cy.findByLabelText('Close drawer').click();
        });
    });
});
