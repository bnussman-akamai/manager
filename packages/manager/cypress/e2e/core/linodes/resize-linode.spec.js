"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var linodes_1 = require("support/util/linodes");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var authentication_1 = require("support/api/authentication");
var linodes_2 = require("support/intercepts/linodes");
var linodes_3 = require("support/constants/linodes");
(0, authentication_1.authenticate)();
describe('resize linode', function () {
    beforeEach(function () {
        (0, cleanup_1.cleanUp)(['linodes']);
        cy.tag('method:e2e');
    });
    it('resizes a linode by increasing size: warm migration', function () {
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to interact with it shortly after booting up when the
        // Linode is attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_1.createTestLinode)({ booted: true }, { securityMethod: 'vlan_no_internet' });
        }).then(function (linode) {
            (0, linodes_2.interceptLinodeResize)(linode.id).as('linodeResize');
            cy.visitWithLogin("/linodes/".concat(linode.id, "?resize=true"));
            ui_1.ui.dialog
                .findByTitle("Resize Linode ".concat(linode.label))
                .should('be.visible')
                .within(function () {
                // Click "Shared CPU" plan tab, and select 8 GB plan.
                ui_1.ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();
                cy.contains('Linode 8 GB').should('be.visible').click();
                // Select warm resize option, and enter Linode label in type-to-confirm field.
                cy.findByText('Warm resize').as('qaWarmResize').scrollIntoView();
                cy.get('@qaWarmResize').should('be.visible').click();
                cy.findByLabelText('Linode Label').type(linode.label);
                // Click "Resize Linode".
                // The Resize Linode button remains disabled while the Linode is provisioning,
                // so we have to wait for that to complete before the button becomes enabled.
                ui_1.ui.button
                    .findByTitle('Resize Linode')
                    .should('be.enabled', { timeout: linodes_3.LINODE_CREATE_TIMEOUT })
                    .click();
            });
            cy.wait('@linodeResize');
            cy.contains('Your linode will be warm resized and will automatically attempt to power off and restore to its previous state.').should('be.visible');
        });
    });
    it('resizes a linode by increasing size: cold migration', function () {
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to interact with it shortly after booting up when the
        // Linode is attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_1.createTestLinode)({ booted: true }, { securityMethod: 'vlan_no_internet' });
        }).then(function (linode) {
            (0, linodes_2.interceptLinodeResize)(linode.id).as('linodeResize');
            cy.visitWithLogin("/linodes/".concat(linode.id, "?resize=true"));
            ui_1.ui.dialog
                .findByTitle("Resize Linode ".concat(linode.label))
                .should('be.visible')
                .within(function () {
                ui_1.ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();
                cy.contains('Linode 8 GB').should('be.visible').click();
                cy.findByText('Cold resize').as('qaColdResize').scrollIntoView();
                cy.get('@qaColdResize').should('be.visible').click();
                cy.findByLabelText('Linode Label').type(linode.label);
                // Click "Resize Linode".
                // The Resize Linode button remains disabled while the Linode is provisioning,
                // so we have to wait for that to complete before the button becomes enabled.
                ui_1.ui.button
                    .findByTitle('Resize Linode')
                    .should('be.enabled', { timeout: linodes_3.LINODE_CREATE_TIMEOUT })
                    .click();
            });
            cy.wait('@linodeResize');
            cy.contains('Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).').should('be.visible');
        });
    });
    it('resizes a linode by increasing size when offline: cold migration', function () {
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to interact with it shortly after booting up when the
        // Linode is attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_1.createTestLinode)({ booted: false }, { securityMethod: 'vlan_no_internet' });
        }).then(function (linode) {
            (0, linodes_2.interceptLinodeResize)(linode.id).as('linodeResize');
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.findByText('OFFLINE', { timeout: linodes_3.LINODE_CREATE_TIMEOUT });
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .click();
            ui_1.ui.actionMenuItem
                .findByTitle('Resize')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle("Resize Linode ".concat(linode.label))
                .should('be.visible')
                .within(function () {
                ui_1.ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();
                cy.contains('Linode 8 GB').should('be.visible').click();
                // When a Linode is powered off, only cold resizes are available.
                // Confirm that the UI reflects this by ensuring the cold resize
                // option is checked and both radio buttons are disabled.
                cy.findByLabelText('Warm resize', { exact: false })
                    .should('be.disabled')
                    .should('not.be.checked');
                cy.findByLabelText('Cold resize')
                    .should('be.disabled')
                    .should('be.checked');
                // Enter Linode label in type-to-confirm field and proceed with resize.
                cy.findByLabelText('Linode Label').type(linode.label);
                ui_1.ui.button.findByTitle('Resize Linode').should('be.enabled').click();
            });
            cy.wait('@linodeResize');
            cy.contains('Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).').should('be.visible');
        });
    });
    it('resizes a linode by decreasing size', function () {
        // Use `vlan_no_internet` security method.
        // This works around an issue where the Linode API responds with a 400
        // when attempting to interact with it shortly after booting up when the
        // Linode is attached to a Cloud Firewall.
        cy.defer(function () {
            return (0, linodes_1.createTestLinode)({ booted: true, type: 'g6-standard-2' }, { securityMethod: 'vlan_no_internet' });
        }).then(function (linode) {
            var diskName = 'Ubuntu 24.04 LTS Disk';
            var size = '50000'; // 50 GB
            // Error flow when attempting to resize a linode to a smaller size without
            // resizing the disk to the requested size first.
            (0, linodes_2.interceptLinodeResize)(linode.id).as('linodeResize');
            cy.visitWithLogin("/linodes/".concat(linode.id, "?resize=true"));
            ui_1.ui.dialog
                .findByTitle("Resize Linode ".concat(linode.label))
                .should('be.visible')
                .within(function () {
                ui_1.ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();
                cy.contains('Linode 2 GB').should('be.visible').click();
                cy.findByLabelText('Linode Label').type(linode.label);
                // Click "Resize Linode".
                // The Resize Linode button remains disabled while the Linode is provisioning,
                // so we have to wait for that to complete before the button becomes enabled.
                ui_1.ui.button
                    .findByTitle('Resize Linode')
                    .should('be.enabled', { timeout: linodes_3.LINODE_CREATE_TIMEOUT })
                    .click();
            });
            // Confirm that API responds with an error message when attempting to
            // decrease the size of the Linode while its disk is too large.
            cy.wait('@linodeResize');
            cy.contains('The current disk size of your Linode is too large for the new service plan. Please resize your disk to accommodate the new plan. You can read our Resize Your Linode guide for more detailed instructions.')
                .as('qaTheCurrentDisk')
                .scrollIntoView();
            cy.get('@qaTheCurrentDisk').should('be.visible');
            // Normal flow when resizing a linode to a smaller size after first resizing
            // its disk.
            cy.visitWithLogin("/linodes/".concat(linode.id, "/storage"));
            // Power off the Linode to resize the disk
            ui_1.ui.button.findByTitle('Power Off').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Power Off Linode ".concat(linode.label, "?"))
                .should('be.visible')
                .then(function () {
                ui_1.ui.button
                    .findByTitle("Power Off Linode")
                    .should('be.visible')
                    .click();
            });
            // Wait for Linode to power off, then resize the disk to 50 GB.
            cy.findByText('OFFLINE', { timeout: linodes_3.LINODE_CREATE_TIMEOUT }).should('be.visible');
            cy.findByText(diskName)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Resize')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            ui_1.ui.drawer
                .findByTitle("Resize ".concat(diskName))
                .should('be.visible')
                .within(function () {
                cy.contains('Size (required)').should('be.visible').click();
                cy.focused().clear();
                cy.focused().type(size);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Resize')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Wait until the disk resize is done, then initiate another resize attempt.
            ui_1.ui.toast.assertMessage("Disk ".concat(diskName, " on Linode ").concat(linode.label, " has been resized."));
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .click();
            ui_1.ui.actionMenuItem
                .findByTitle('Resize')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle("Resize Linode ".concat(linode.label))
                .should('be.visible')
                .within(function () {
                ui_1.ui.tabList.findTabByTitle('Shared CPU').should('be.visible').click();
                cy.contains('Linode 2 GB').should('be.visible').click();
                cy.findByLabelText('Linode Label').type(linode.label);
                // Click "Resize Linode".
                // The Resize Linode button remains disabled while the Linode is provisioning,
                // so we have to wait for that to complete before the button becomes enabled.
                ui_1.ui.button
                    .findByTitle('Resize Linode')
                    .should('be.enabled', { timeout: linodes_3.LINODE_CREATE_TIMEOUT })
                    .click();
            });
            // Confirm that the resize API request succeeds now that the Linode's disk
            // size has been decreased.
            cy.wait('@linodeResize');
            cy.contains('Your Linode will soon be automatically powered off, migrated, and restored to its previous state (booted or powered off).').should('be.visible');
        });
    });
});
