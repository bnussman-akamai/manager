"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var volume_1 = require("src/factories/volume");
var authentication_1 = require("support/api/authentication");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var cleanup_1 = require("support/util/cleanup");
var ui_1 = require("support/ui");
var volumes_1 = require("support/api/volumes");
(0, authentication_1.authenticate)();
describe('volume update flow', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['tags', 'volumes']);
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Confirms that volume label can be changed from the Volumes landing page.
     */
    it("updates a volume's label", function () {
        var volumeRequest = volume_1.volumeRequestPayloadFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
        });
        var newLabel = (0, random_1.randomLabel)();
        cy.defer(function () { return (0, volumes_1.createActiveVolume)(volumeRequest); }, 'creating volume').then(function (volume) {
            cy.visitWithLogin('/volumes', {
                // Temporarily force volume table to show up to 100 results per page.
                // This is a workaround while we wait to get stuck volumes removed.
                // @TODO Remove local storage override when stuck volumes are removed from test accounts.
                localStorageOverrides: {
                    PAGE_SIZE: 100,
                },
            });
            // Confirm that volume is listed on landing page, click "Edit" to open drawer.
            cy.findByText(volume.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('active').should('be.visible');
            });
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Volume ".concat(volume.label))
                .should('be.visible')
                .click();
            cy.get('[data-testid="Edit"]').click();
            // Enter new label, click "Save Changes".
            cy.get('[data-qa-drawer="true"]').within(function () {
                cy.findByText('Edit Volume').should('be.visible');
                cy.findByDisplayValue(volume.label)
                    .should('be.visible')
                    .click()
                    .type("{selectall}{backspace}".concat(newLabel));
                cy.findByText('Save Changes').should('be.visible').click();
            });
            // Confirm new label is applied, click "Edit" to re-open drawer.
            cy.findByText(newLabel).should('be.visible');
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Volume ".concat(newLabel))
                .should('be.visible')
                .click();
            cy.get('[data-testid="Edit"]').click();
            // Confirm new label is shown.
            cy.get('[data-qa-drawer="true"]').within(function () {
                cy.findByText('Edit Volume').should('be.visible');
                cy.findByDisplayValue(newLabel).should('be.visible');
            });
        });
    });
    /*
     * - Confirms that volume tags can be changed from the Volumes landing page.
     */
    it("updates volume's tags", function () {
        var volumeRequest = volume_1.volumeRequestPayloadFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
        });
        var newTags = [(0, random_1.randomLabel)(5), (0, random_1.randomLabel)(5), (0, random_1.randomLabel)(5)];
        cy.defer(function () { return (0, volumes_1.createActiveVolume)(volumeRequest); }, 'creating volume').then(function (volume) {
            cy.visitWithLogin('/volumes', {
                // Temporarily force volume table to show up to 100 results per page.
                // This is a workaround while we wait to get stuck volumes removed.
                // @TODO Remove local storage override when stuck volumes are removed from test accounts.
                localStorageOverrides: {
                    PAGE_SIZE: 100,
                },
            });
            // Confirm that volume is listed on landing page, click "Edit" to open drawer.
            cy.findByText(volume.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('active').should('be.visible');
            });
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Volume ".concat(volume.label))
                .should('be.visible')
                .click();
            cy.get('[data-testid="Manage Tags"]').click();
            // Add tags, click "Save Changes".
            cy.get('[data-qa-drawer="true"]').within(function () {
                cy.findByText('Manage Volume Tags').should('be.visible');
                cy.findByPlaceholderText('Type to choose or create a tag.')
                    .should('be.visible')
                    .click()
                    .type("".concat(newTags.join('{enter}'), "{enter}"));
                cy.findByText('Save Changes').should('be.visible').click();
            });
            // Confirm new tags are shown, click "Manage Volume Tags" to re-open drawer.
            cy.findByText(volumeRequest.label).should('be.visible');
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Volume ".concat(volume.label))
                .should('be.visible')
                .click();
            cy.get('[data-testid="Manage Tags"]').click();
            cy.get('[data-qa-drawer="true"]').within(function () {
                cy.findByText('Manage Volume Tags').should('be.visible');
                // Click the tags input field to see all the selected tags
                cy.findByRole('combobox').should('be.visible').click();
                newTags.forEach(function (newTag) {
                    cy.findAllByText(newTag).should('be.visible');
                });
            });
        });
    });
    after(function () {
        (0, cleanup_1.cleanUp)(['tags', 'volumes']);
    });
});
