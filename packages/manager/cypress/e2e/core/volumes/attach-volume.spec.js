"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var volumes_1 = require("@linode/api-v4/lib/volumes");
var linodes_1 = require("src/factories/linodes");
var volume_1 = require("src/factories/volume");
var authentication_1 = require("support/api/authentication");
var volumes_2 = require("support/intercepts/volumes");
var random_1 = require("support/util/random");
var ui_1 = require("support/ui");
var regions_1 = require("support/util/regions");
var configs_1 = require("support/intercepts/configs");
var cleanup_1 = require("support/util/cleanup");
var linodes_2 = require("support/util/linodes");
// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
var pageSizeOverride = {
    PAGE_SIZE: 100,
};
/**
 * Creates a Linode and a Volume that is attached to the created Linode.
 *
 * @returns Promise that resolves to an array containing created Linode and Volume.
 */
// TODO Uncomment `createAndAtttachVolume` once volume detach tests are unskipped, or delete if tests are removed.
// const createLinodeAndAttachVolume = async (): Promise<[Linode, Volume]> => {
//   const commonRegion = chooseRegion();
//   const linodeRequest = createLinodeRequestFactory.build({
//     label: randomLabel(),
//     region: commonRegion.id,
//     root_pass: randomString(32),
//   });
//   const linode = await createLinode(linodeRequest);
//   const volumeRequest = volumeRequestPayloadFactory.build({
//     label: randomLabel(),
//     region: commonRegion.id,
//     linode_id: linode.id,
//   });
//   const volume = await createVolume(volumeRequest);
//   return [linode, volume];
// };
(0, authentication_1.authenticate)();
describe('volume attach and detach flows', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['volumes', 'linodes']);
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Clicks "Attach" action menu item for volume, selects Linode with common region, and submits form.
     * - Confirms that volume attach toast appears and that Linode is listed as attached for Volume.
     */
    it('attaches a volume to a Linode', function () {
        var commonRegion = (0, regions_1.chooseRegion)();
        var volumeRequest = volume_1.volumeRequestPayloadFactory.build({
            label: (0, random_1.randomLabel)(),
            region: commonRegion.id,
        });
        var linodeRequest = linodes_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: commonRegion.id,
            root_pass: (0, random_1.randomString)(32),
            booted: false,
        });
        var entityPromise = Promise.all([
            (0, volumes_1.createVolume)(volumeRequest),
            (0, linodes_2.createTestLinode)(linodeRequest),
        ]);
        cy.defer(function () { return entityPromise; }, 'creating Volume and Linode').then(function (_a) {
            var volume = _a[0], linode = _a[1];
            (0, volumes_2.interceptAttachVolume)(volume.id).as('attachVolume');
            (0, configs_1.interceptGetLinodeConfigs)(linode.id).as('getLinodeConfigs');
            cy.visitWithLogin('/volumes', {
                localStorageOverrides: pageSizeOverride,
            });
            // Confirm that volume is listed, initiate attachment.
            cy.findByText(volume.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByLabelText("Action menu for Volume ".concat(volume.label)).click();
            });
            cy.get('[data-qa-action-menu-item="Attach"]:visible')
                .should('be.visible')
                .click();
            ui_1.ui.drawer.findByTitle("Attach Volume ".concat(volume.label)).within(function () {
                cy.findByLabelText('Linode')
                    .should('be.visible')
                    .click()
                    .type(linode.label);
                ui_1.ui.autocompletePopper
                    .findByTitle(linode.label)
                    .should('be.visible')
                    .click();
                cy.wait('@getLinodeConfigs');
                ui_1.ui.button.findByTitle('Attach').should('be.visible').click();
            });
            // Confirm that volume has been attached to Linode.
            cy.wait('@attachVolume').its('response.statusCode').should('eq', 200);
            ui_1.ui.toast.assertMessage("Volume ".concat(volume.label, " has been attached to Linode ").concat(linode.label, "."));
            cy.findByText(volume.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText(linode.label).should('be.visible');
            });
        });
    });
    // TODO Unskip once volume detach issue is resolved.
    /*
     * - Clicks "Detach" action menu item for volume.
     * - Confirms that volume detach toast appears and that Linode is no longer listed as attached for Volume.
     */
    // it.skip('detaches a volume from a Linode', () => {
    //   cy.defer(
    //     createLinodeAndAttachVolume(),
    //     'creating attached Volume and Linode'
    //   ).then(([linode, volume]: [Linode, Volume]) => {
    //     interceptDetachVolume(volume.id).as('detachVolume');
    //     // @TODO Wait for Linode to finish provisioning before initiating detach.
    //     cy.visitWithLogin('/volumes', {
    //       localStorageOverrides: pageSizeOverride,
    //     });
    //     // Confirm that volume is listed, initiate detachment.
    //     cy.findByText(volume.label)
    //       .should('be.visible')
    //       .closest('tr')
    //       .within(() => {
    //         cy.findByLabelText(`Action menu for Volume ${volume.label}`).click();
    //       });
    //     cy.get('[data-qa-action-menu-item="Detach"]:visible')
    //       .should('be.visible')
    //       .click();
    //     cy.findByText(`Detach Volume ${volume.label}?`)
    //       .should('be.visible')
    //       .closest('[role="dialog"]')
    //       .within(() => {
    //         cy.findByText('Detach Volume').should('be.visible').click();
    //       });
    //     // Confirm that volume has been detached.
    //     cy.wait('@detachVolume').its('response.statusCode').should('eq', 200);
    //     // @TODO Improve toast check.
    //     cy.findByText(`Volume ${volume.label} successfully detached.`);
    //     cy.findByText(volume.label)
    //       .should('be.visible')
    //       .closest('tr')
    //       .within(() => {
    //         cy.findByText('Unattached').should('be.visible');
    //         cy.findByText(linode.label).should('not.exist');
    //       });
    //   });
    // });
    // TODO Unskip once volume detach issue is resolved.
    /*
     * - Clicks "Detach" action menu item for volume on Linode details page.
     * - Confirms that volume is no longer listed on Linode details page.
     * - Confirms that Linode is no longer listed as attached to Volume on Volumes landing page.
     */
    // it.skip('detaches a volume from a Linode via Linode details page', () => {
    //   cy.defer(
    //     createLinodeAndAttachVolume(),
    //     'creating attached Volume and Linode'
    //   ).then(([linode, volume]: [Linode, Volume]) => {
    //     // Wait for Linode to finish provisioning and booting.
    //     cy.visitWithLogin(`/linodes/${linode.id}/storage`);
    //     cy.get('[data-qa-linode-status="true"]').within(() => {
    //       cy.findByText('RUNNING').should('be.visible');
    //     });
    //     // Confirm that Volume is listed on Linode details page and initiate detachment.
    //     cy.findByLabelText('List of volume').within(() => {
    //       cy.findByText(volume.label)
    //         .closest('tr')
    //         .within(() => {
    //           cy.findByLabelText(`Action menu for Volume ${volume.label}`)
    //             .should('be.visible')
    //             .click();
    //         });
    //     });
    //     cy.get('[data-qa-action-menu-item="Detach"]:visible')
    //       .should('be.visible')
    //       .click();
    //     cy.findByText(`Detach Volume ${volume.label}?`)
    //       .should('be.visible')
    //       .closest('[role="dialog"]')
    //       .within(() => {
    //         cy.findByText('Detach Volume').should('be.visible').click();
    //       });
    //     // Confirm that Volume is no longer listed on Linode details page.
    //     cy.findByLabelText('List of volume').within(() => {
    //       cy.findByText(volume.label).should('not.exist');
    //     });
    //     // Confirm that Volume is no longer shown as attached on Volumes landing page.
    //     cy.visitWithLogin('/volumes');
    //     cy.findByText(volume.label)
    //       .should('be.visible')
    //       .closest('tr')
    //       .within(() => {
    //         cy.findByText('Unattached').should('be.visible');
    //         cy.findByText(linode.label).should('not.to.exist');
    //       });
    //   });
    // });
});
