"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var authentication_1 = require("support/api/authentication");
var linodes_1 = require("support/intercepts/linodes");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var linodes_2 = require("support/constants/linodes");
var linodes_3 = require("support/util/linodes");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
// Submits the Rescue Linode dialog, initiating reboot into rescue mode.
var rebootInRescueMode = function () {
    ui_1.ui.button
        .findByTitle('Reboot into Rescue Mode')
        .should('be.visible')
        .should('be.enabled')
        .should('have.attr', 'data-qa-form-data-loading', 'false')
        .click();
};
(0, authentication_1.authenticate)();
describe('Rescue Linodes', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes', 'lke-clusters']);
    });
    /*
     * - Creates a Linode, waits for it to boot, and reboots it into rescue mode.
     * - Confirms that rescue mode API requests succeed.
     * - Confirms that Linode status changes to "Rebooting".
     * - Confirms that toast appears confirming successful reboot into rescue mode.
     */
    it('Can reboot a Linode into rescue mode', function () {
        cy.tag('method:e2e');
        var linodePayload = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
        });
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to interact with it shortly after booting up when the
        // Linode is attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_3.createTestLinode)(linodePayload, { securityMethod: 'vlan_no_internet' });
        }, 'creating Linode').then(function (linode) {
            (0, linodes_1.interceptGetLinodeDetails)(linode.id).as('getLinode');
            (0, linodes_1.interceptRebootLinodeIntoRescueMode)(linode.id).as('rebootLinodeRescueMode');
            var rescueUrl = "/linodes/".concat(linode.id);
            cy.visitWithLogin(rescueUrl);
            cy.wait('@getLinode');
            // Wait for Linode to boot.
            cy.findByText('RUNNING', { timeout: linodes_2.LINODE_CREATE_TIMEOUT }).should('be.visible');
            // Open rescue dialog using action menu..
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .should('be.visible')
                .click();
            ui_1.ui.actionMenuItem.findByTitle('Rescue').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Rescue Linode ".concat(linode.label))
                .should('be.visible')
                .within(function () {
                rebootInRescueMode();
            });
            // Check intercepted response and make sure UI responded correctly.
            cy.wait('@rebootLinodeRescueMode')
                .its('response.statusCode')
                .should('eq', 200);
            ui_1.ui.toast.assertMessage('Linode rescue started.');
            cy.findByText('REBOOTING').should('be.visible');
        });
    });
    /*
     * - Confirms UI error flow when user rescues a Linode that is provisioning.
     * - Confirms that API error message is displayed in the rescue dialog.
     */
    it('Cannot reboot a provisioning Linode into rescue mode', function () {
        var mockLinode = factories_1.linodeFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
            status: 'provisioning',
        });
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, linodes_1.mockGetLinodeDisks)(mockLinode.id, []).as('getLinodeDisks');
        (0, linodes_1.mockGetLinodeVolumes)(mockLinode.id, []).as('getLinodeVolumes');
        (0, linodes_1.mockRebootLinodeIntoRescueModeError)(mockLinode.id, 'Linode busy.').as('rescueLinode');
        cy.visitWithLogin("/linodes/".concat(mockLinode.id, "?rescue=true"));
        ui_1.ui.dialog
            .findByTitle("Rescue Linode ".concat(mockLinode.label))
            .should('be.visible')
            .within(function () {
            rebootInRescueMode();
            cy.wait('@rescueLinode');
            cy.findByText('Linode busy.').should('be.visible');
        });
    });
});
