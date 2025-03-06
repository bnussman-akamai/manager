"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var volume_1 = require("src/factories/volume");
var authentication_1 = require("support/api/authentication");
var volumes_1 = require("support/intercepts/volumes");
var cleanup_1 = require("support/util/cleanup");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var volumes_2 = require("support/api/volumes");
// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
var pageSizeOverride = {
    PAGE_SIZE: 100,
};
(0, authentication_1.authenticate)();
describe('volume clone flow', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('volumes');
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Clicks "Clone" action menu item for volume, enters new label, and submits form.
     * - Confirms that new volume appears in landing page with expected label and size.
     */
    it('clones a volume', function () {
        var volumeRequest = volume_1.volumeRequestPayloadFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
        });
        var cloneVolumeLabel = (0, random_1.randomLabel)();
        cy.defer(function () { return (0, volumes_2.createActiveVolume)(volumeRequest); }, 'creating volume').then(function (volume) {
            (0, volumes_1.interceptCloneVolume)(volume.id).as('cloneVolume');
            cy.visitWithLogin('/volumes', {
                localStorageOverrides: pageSizeOverride,
            });
            // Confirm that volume is listed, initiate clone.
            cy.findByText(volume.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('active').should('be.visible');
                cy.findByLabelText("Action menu for Volume ".concat(volume.label)).click();
            });
            cy.get('[data-qa-action-menu-item="Clone"]:visible')
                .should('be.visible')
                .click();
            // Input new volume label and submit.
            cy.get('[data-qa-drawer-title="Clone Volume"]')
                .closest('[data-qa-drawer="true"]')
                .should('be.visible')
                .within(function () {
                cy.findByText('Label').click().type(cloneVolumeLabel);
                cy.get('[data-qa-buttons="true"]').within(function () {
                    cy.findByText('Clone Volume').should('be.visible').click();
                });
            });
            // Confirm that volume has been cloned.
            cy.wait('@cloneVolume').its('response.statusCode').should('eq', 200);
            cy.findByText(cloneVolumeLabel)
                .closest('tr')
                .within(function () {
                cy.findByText("".concat(volume.size, " GB")).should('be.visible');
            });
        });
    });
});
