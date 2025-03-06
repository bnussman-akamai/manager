"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var authentication_1 = require("support/api/authentication");
var linodes_1 = require("support/constants/linodes");
var cleanup_1 = require("support/util/cleanup");
var linodes_2 = require("support/util/linodes");
(0, authentication_1.authenticate)();
describe('switch linode state', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes']);
        cy.tag('method:e2e');
    });
    /*
     * - Confirms that a Linode can be shut down from the Linodes landing page.
     * - Confirms flow end-to-end using real API requests.
     * - Confirms that landing page UI updates to reflect Linode power state.
     * - Does not wait for Linode to finish being shut down before succeeding.
     */
    it('powers off a linode from landing page', function () {
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to reboot shortly after booting up when the Linode is
        // attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_2.createTestLinode)({ booted: true }, { securityMethod: 'vlan_no_internet' });
        }).then(function (linode) {
            cy.visitWithLogin('/linodes');
            cy.get("[data-qa-linode=\"".concat(linode.label, "\"]"))
                .should('be.visible')
                .within(function () {
                cy.contains('Running', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('be.visible');
            });
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .should('be.visible')
                .click();
            ui_1.ui.actionMenuItem.findByTitle('Power Off').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Power Off Linode ".concat(linode.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Power Off Linode')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.get("[data-qa-linode=\"".concat(linode.label, "\"]"))
                .should('be.visible')
                .within(function () {
                cy.contains('Shutting Down').should('be.visible');
            });
        });
    });
    /*
     * - Confirms that a Linode can be shut down from its details page.
     * - Confirms flow end-to-end using real API requests.
     * - Confirms that details page UI updates to reflect Linode power state.
     * - Waits for Linode to fully shut down before succeeding.
     */
    it('powers off a linode from details page', function () {
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to reboot shortly after booting up when the Linode is
        // attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_2.createTestLinode)({ booted: true }, { securityMethod: 'vlan_no_internet' });
        }).then(function (linode) {
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.contains('RUNNING', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('be.visible');
            cy.findByText(linode.label).should('be.visible');
            cy.findByText('Power Off').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Power Off Linode ".concat(linode.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Power Off Linode')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.contains('SHUTTING DOWN').should('be.visible');
            cy.contains('OFFLINE', { timeout: 300000 }).should('be.visible');
        });
    });
    /*
     * - Confirms that a Linode can be booted from the Linode landing page.
     * - Confirms flow end-to-end using real API requests.
     * - Confirms that landing page UI updates to reflect Linode power state.
     * - Waits for Linode to finish booting up before succeeding.
     */
    it('powers on a linode from landing page', function () {
        cy.defer(function () { return (0, linodes_2.createTestLinode)({ booted: false }); }).then(function (linode) {
            cy.visitWithLogin('/linodes');
            cy.get("[data-qa-linode=\"".concat(linode.label, "\"]"))
                .should('be.visible')
                .within(function () {
                cy.contains('Offline', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('be.visible');
            });
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .should('be.visible')
                .click();
            ui_1.ui.actionMenuItem.findByTitle('Power On').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Power On Linode ".concat(linode.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Power On Linode')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.get("[data-qa-linode=\"".concat(linode.label, "\"]"))
                .should('be.visible')
                .within(function () {
                cy.contains('Booting').should('be.visible');
                cy.contains('Running', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('be.visible');
            });
        });
    });
    /*
     * - Confirms that a Linode can be booted from its details page.
     * - Confirms flow end-to-end using real API requests.
     * - Confirms that details page UI updates to reflect Linode power state.
     * - Does not wait for Linode to finish booting up before succeeding.
     */
    it('powers on a linode from details page', function () {
        cy.defer(function () { return (0, linodes_2.createTestLinode)({ booted: false }); }).then(function (linode) {
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.contains('OFFLINE', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('be.visible');
            cy.findByText(linode.label).should('be.visible');
            cy.findByText('Power On').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Power On Linode ".concat(linode.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Power On Linode')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.contains('BOOTING').should('be.visible');
        });
    });
    /*
     * - Confirms that a Linode can be rebooted from the Linode landing page.
     * - Confirms flow end-to-end using real API requests.
     * - Confirms that landing page UI updates to reflect Linode power state.
     * - Does not wait for Linode to finish rebooting before succeeding.
     */
    it('reboots a linode from landing page', function () {
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to reboot shortly after booting up when the Linode is
        // attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_2.createTestLinode)({ booted: true }, { securityMethod: 'vlan_no_internet' });
        }).then(function (linode) {
            cy.visitWithLogin('/linodes');
            cy.get("[data-qa-linode=\"".concat(linode.label, "\"]"))
                .should('be.visible')
                .within(function () {
                cy.contains('Running', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('be.visible');
            });
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .should('be.visible')
                .click();
            ui_1.ui.actionMenuItem.findByTitle('Reboot').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Reboot Linode ".concat(linode.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Reboot Linode')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.get("[data-qa-linode=\"".concat(linode.label, "\"]"))
                .should('be.visible')
                .within(function () {
                cy.contains('Rebooting').should('be.visible');
            });
        });
    });
    /*
     * - Confirms that a Linode can be rebooted from its details page.
     * - Confirms flow end-to-end using real API requests.
     * - Confirms that details page UI updates to reflect Linode power state.
     * - Waits for Linode to finish rebooting before succeeding.
     */
    it('reboots a linode from details page', function () {
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to reboot shortly after booting up when the Linode is
        // attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_2.createTestLinode)({ booted: true }, { securityMethod: 'vlan_no_internet' });
        }).then(function (linode) {
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.contains('RUNNING', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('be.visible');
            cy.findByText(linode.label).should('be.visible');
            cy.findByText('Reboot').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Reboot Linode ".concat(linode.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Reboot Linode')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.contains('REBOOTING').should('be.visible');
            cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
        });
    });
});
