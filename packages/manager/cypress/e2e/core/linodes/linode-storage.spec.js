"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable sonarjs/no-duplicate-string */
var linodes_1 = require("support/constants/linodes");
var authentication_1 = require("support/api/authentication");
var linodes_2 = require("support/util/linodes");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var linodes_3 = require("support/intercepts/linodes");
/**
 * Waits for a Linode to finish provisioning by checking the details page status indicator.
 */
var waitForProvision = function () {
    cy.findByText('PROVISIONING', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('not.exist');
    cy.findByText('BOOTING', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('not.exist');
    cy.findByText('Creating', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('not.exist');
};
// Size values (in MB) to use when creating and resizing disks.
var DISK_CREATE_SIZE_MB = 512;
var DISK_RESIZE_SIZE_MB = 768;
/**
 * Deletes an in-use disk of the given name.
 *
 * @param diskName - Name of disk to attempt to delete.
 */
var deleteInUseDisk = function (diskName) {
    waitForProvision();
    ui_1.ui.actionMenu
        .findByTitle("Action menu for Disk ".concat(diskName))
        .should('be.visible')
        .click();
    ui_1.ui.actionMenuItem
        .findByTitle('Delete')
        .should('be.visible')
        .as('deleteMenuItem')
        .should('have.attr', 'aria-disabled');
    // The 'have.attr' assertion changes the Cypress subject to the value of the attr.
    // Using `cy.get()` against the alias reselects the item.
    cy.get('@deleteMenuItem').within(function () {
        ui_1.ui.button
            .findByAttribute('data-qa-help-button', 'true')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
    cy.findByText('Your Linode must be fully powered down in order to perform this action').should('be.visible');
};
/**
 * Deletes a disk of the given name.
 *
 * @param diskName - Name of disk to delete.
 */
var deleteDisk = function (diskName) {
    waitForProvision();
    ui_1.ui.actionMenu
        .findByTitle("Action menu for Disk ".concat(diskName))
        .should('be.visible')
        .click();
    ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
    ui_1.ui.dialog
        .findByTitle('Confirm Delete')
        .should('be.visible')
        .within(function () {
        ui_1.ui.button
            .findByTitle('Delete')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
};
/**
 * Adds a new disk with the given name and optional size.
 *
 * If `diskSize` is not specified, the new disk will be 512MB.
 *
 * @param diskName - Name of new disk.
 * @param diskSize - Size of new disk in megabytes.
 */
var addDisk = function (diskName, diskSize) {
    if (diskSize === void 0) { diskSize = DISK_CREATE_SIZE_MB; }
    cy.contains('PROVISIONING', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('not.exist');
    cy.contains('BOOTING', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('not.exist');
    cy.contains('OFFLINE', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('be.visible');
    ui_1.ui.button.findByTitle('Add a Disk').click();
    ui_1.ui.drawer
        .findByTitle('Create Disk')
        .should('be.visible')
        .within(function () {
        cy.findByLabelText('Label (required)').type(diskName);
        cy.findByLabelText('Size (required)').clear();
        cy.focused().type("".concat(diskSize));
        ui_1.ui.button.findByTitle('Create').click();
    });
    ui_1.ui.toast.assertMessage("Started creation of disk ".concat(diskName));
};
(0, authentication_1.authenticate)();
beforeEach(function () {
    cy.tag('method:e2e');
});
describe('linode storage tab', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes', 'lke-clusters']);
    });
    /*
     * - Confirms UI flow end-to-end when a user attempts to delete a Linode disk that's in use.
     * - Confirms that error occurs and user is informed that they must power down their Linode.
     */
    it('try to delete in use disk', function () {
        var diskName = 'Ubuntu 24.04 LTS Disk';
        cy.defer(function () { return (0, linodes_2.createTestLinode)({ booted: true }); }).then(function (linode) {
            (0, linodes_3.interceptDeleteDisks)(linode.id).as('deleteDisk');
            cy.visitWithLogin("linodes/".concat(linode.id, "/storage"));
            cy.contains('RUNNING', { timeout: linodes_1.LINODE_CREATE_TIMEOUT });
            cy.findByText(diskName).should('be.visible');
            ui_1.ui.button.findByTitle('Add a Disk').should('be.disabled');
            cy.get("[data-qa-disk=\"".concat(diskName, "\"]")).within(function () {
                cy.contains('Resize').should('be.disabled');
            });
            deleteInUseDisk(diskName);
            ui_1.ui.button.findByTitle('Add a Disk').should('be.disabled');
        });
    });
    /*
     * - Confirms UI flow end-to-end when a user deletes a Linode disk.
     * - Confirms that user can successfully delete a disk from a Linode.
     * - Confirms that Cloud Manager UI automatically updates to reflect deleted disk.
     */
    it('delete disk', function () {
        var diskName = 'cy-test-disk';
        cy.defer(function () { return (0, linodes_2.createTestLinode)({ image: null }); }).then(function (linode) {
            (0, linodes_3.interceptDeleteDisks)(linode.id).as('deleteDisk');
            (0, linodes_3.interceptAddDisks)(linode.id).as('addDisk');
            cy.visitWithLogin("/linodes/".concat(linode.id, "/storage"));
            addDisk(diskName);
            cy.findByText(diskName).should('be.visible');
            cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
            // Disk should show "Creating". We must wait for it to finish "Creating" before we try to delete the disk
            cy.findByText('Creating', { exact: false }).should('be.visible');
            // "Creating" should go away when the Disk is able to be deleted
            cy.findByText('Creating', { exact: false }).should('not.exist');
            deleteDisk(diskName);
            cy.wait('@deleteDisk').its('response.statusCode').should('eq', 200);
            cy.findByText('Deleting', { exact: false }).should('be.visible');
            ui_1.ui.button.findByTitle('Add a Disk').should('be.enabled');
            ui_1.ui.toast.assertMessage("Disk ".concat(diskName, " on Linode ").concat(linode.label, " has been deleted."));
            cy.findByLabelText('List of Disks').within(function () {
                cy.contains(diskName).should('not.exist');
            });
        });
    });
    /*
     * - Confirms UI flow when user adds a disk to a Linode.
     * - Confirms that Cloud Manager UI automatically updates to reflect new disk.
     */
    it('add a disk', function () {
        var diskName = 'cy-test-disk';
        cy.defer(function () { return (0, linodes_2.createTestLinode)({ image: null }); }).then(function (linode) {
            (0, linodes_3.interceptAddDisks)(linode.id).as('addDisk');
            cy.visitWithLogin("/linodes/".concat(linode.id, "/storage"));
            addDisk(diskName);
            cy.findByText(diskName).should('be.visible');
            cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
        });
    });
    /*
     * - Confirms UI flow when a user resizes an existing disk.
     * - Confirms that Cloud Manager UI automatically updates to reflect resize.
     */
    it('resize disk', function () {
        var diskName = 'Debian 12 Disk';
        cy.defer(function () {
            return (0, linodes_2.createTestLinode)({ image: null }, { securityMethod: 'powered_off' });
        }).then(function (linode) {
            (0, linodes_3.interceptAddDisks)(linode.id).as('addDisk');
            (0, linodes_3.interceptResizeDisks)(linode.id).as('resizeDisk');
            cy.visitWithLogin("/linodes/".concat(linode.id, "/storage"));
            waitForProvision();
            addDisk(diskName);
            cy.findByText(diskName).should('be.visible');
            cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
            cy.findByLabelText('List of Disks').within(function () {
                // Confirm that "Creating" message appears then disappears.
                cy.contains('Creating').should('be.visible');
                cy.contains('Creating').should('not.exist');
            });
            cy.get("[data-qa-disk=\"".concat(diskName, "\"]")).within(function () {
                cy.findByText('Resize').should('be.visible').click();
            });
            ui_1.ui.drawer
                .findByTitle("Resize ".concat(diskName))
                .should('be.visible')
                .within(function () {
                cy.findByLabelText('Size (required)').clear();
                cy.focused().type("".concat(DISK_RESIZE_SIZE_MB));
                ui_1.ui.button.findByTitle('Resize').click();
            });
            cy.wait('@resizeDisk').its('response.statusCode').should('eq', 200);
            ui_1.ui.toast.assertMessage('Disk queued for resizing.');
            ui_1.ui.toast.assertMessage("Disk ".concat(diskName, " on Linode ").concat(linode.label, " has been resized."));
        });
    });
});
