"use strict";
/**
 * @file Integration tests for Managed monitors.
 */
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
var managed_1 = require("src/factories/managed");
var managed_2 = require("support/api/managed");
var managed_3 = require("support/intercepts/managed");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
// Message that's shown when no Managed service monitors are set up.
var noMonitorsMessage = "You don't have any Monitors on your account.";
describe('Managed Monitors tab', function () {
    /*
     * - Confirms that service monitors are listed under the Monitors tab.
     * - Confirms that service monitor statuses are correctly shown in the list.
     */
    it('shows list of Managed monitors and their status', function () {
        var monitors = [
            managed_1.monitorFactory.build({ label: 'OK Test Monitor', status: 'ok' }),
            managed_1.monitorFactory.build({
                label: 'Pending Test Monitor',
                status: 'pending',
            }),
            managed_1.monitorFactory.build({
                label: 'Problem Test Monitor',
                status: 'problem',
            }),
        ];
        (0, managed_3.mockGetServiceMonitors)(monitors).as('getMonitors');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/monitors');
        cy.wait('@getMonitors');
        // Confirm that each monitor is listed and shows the correct status.
        [
            { label: 'OK Test Monitor', expectedStatus: 'Verified' },
            { label: 'Pending Test Monitor', expectedStatus: 'Pending' },
            { label: 'Problem Test Monitor', expectedStatus: 'Failed' },
        ].forEach(function (monitorInfo) {
            cy.findByText(monitorInfo.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText(monitorInfo.expectedStatus).should('be.visible');
            });
        });
    });
    /**
     * - Confirms UI flow for editing Managed service monitors.
     * - Confirms UI flows for disabling and enabling Managed service monitors.
     * - Confirms that list reflects changes made to Managed service monitors.
     */
    it('can update Managed monitors', function () {
        var originalLabel = 'Original Monitor';
        var newLabel = 'New Monitor';
        var monitorId = 1;
        var monitorMenuLabel = 'Action menu for Monitor New Monitor';
        var originalMonitor = managed_1.monitorFactory.build({
            id: monitorId,
            body: '200',
            label: originalLabel,
            status: 'ok',
            credentials: [],
        });
        var newMonitor = __assign(__assign({}, originalMonitor), { label: newLabel });
        (0, managed_3.mockGetServiceMonitors)([originalMonitor]).as('getMonitors');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/monitors');
        cy.wait('@getMonitors');
        cy.findByText(originalLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button.findByTitle('Edit').should('be.visible').click();
        });
        ui_1.ui.drawer
            .findByTitle('Edit Monitor')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Monitor Label').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newLabel);
            (0, managed_3.mockUpdateServiceMonitor)(1, newMonitor).as('updateMonitor');
            (0, managed_3.mockGetServiceMonitors)([newMonitor]).as('getMonitors');
            ui_1.ui.button.findByTitle('Save Changes').click();
            cy.wait(['@updateMonitor']);
        });
        // Confirm that monitor label has been updated, then disable the monitor.
        cy.findByText(newLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.actionMenu
                .findByTitle(monitorMenuLabel)
                .should('be.visible')
                .click();
        });
        (0, managed_3.mockDisableServiceMonitor)(monitorId, newMonitor).as('disableMonitor');
        ui_1.ui.actionMenuItem.findByTitle('Disable').click();
        cy.wait('@disableMonitor');
        // Confirm that monitor has been disabled, then re-enable the monitor.
        ui_1.ui.toast.assertMessage('Monitor disabled successfully.');
        cy.findByText(newLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Disabled').should('be.visible');
            ui_1.ui.actionMenu
                .findByTitle(monitorMenuLabel)
                .should('be.visible')
                .click();
        });
        (0, managed_3.mockEnableServiceMonitor)(monitorId, newMonitor).as('enableMonitor');
        ui_1.ui.actionMenuItem.findByTitle('Enable').click();
        cy.wait('@enableMonitor');
        // Confirm that monitor has been re-enabled.
        ui_1.ui.toast.assertMessage('Monitor enabled successfully.');
        cy.findByText(newLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Verified').should('be.visible');
        });
    });
    /**
     * - Confirms UI flow for creating Managed service monitors.
     * - Confirms that list shows new Managed service monitors.
     */
    it('can create Managed monitors', function () {
        var monitorLabel = (0, random_1.randomLabel)();
        var monitorUrl = 'https://www.example.com';
        var newMonitor = managed_1.monitorFactory.build({
            label: monitorLabel,
            address: monitorUrl,
        });
        (0, managed_3.mockGetServiceMonitors)([]).as('getMonitors');
        (0, managed_3.mockCreateServiceMonitor)(newMonitor).as('createMonitor');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/monitors');
        cy.wait('@getMonitors');
        // Confirm that no service monitors are listed, click "Add Monitor" button.
        cy.findByText(noMonitorsMessage).should('be.visible');
        ui_1.ui.button
            .findByTitle('Add Monitor')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm that "Add Monitor" drawer opens, fill out and submit form.
        ui_1.ui.drawer
            .findByTitle('Add Monitor')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Monitor Label', { exact: false })
                .should('be.visible')
                .click();
            cy.focused().type(monitorLabel);
            // Can't `findByLabelText` because multiple elements with "URL" label exist.
            cy.get('input[name="address"]').should('be.visible').click();
            cy.focused().type(monitorUrl);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add Monitor')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that new monitor is listed.
        cy.wait('@createMonitor');
        cy.findByText(monitorLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Pending').should('be.visible');
        });
    });
    /**
     * - Confirms UI flow for deleting a Managed service monitor.
     * - Confirms that service monitor is removed from list upon deletion.
     */
    it('can delete Managed monitors', function () {
        var monitorLabel = (0, random_1.randomLabel)();
        var monitorUrl = 'https://www.example.com';
        var monitorId = 1;
        var monitorMenuLabel = "Action menu for Monitor ".concat(monitorLabel);
        var originalMonitor = managed_1.monitorFactory.build({
            id: monitorId,
            label: monitorLabel,
            address: monitorUrl,
            status: 'ok',
        });
        (0, managed_3.mockGetServiceMonitors)([originalMonitor]).as('getMonitors');
        (0, managed_3.mockDeleteServiceMonitor)(monitorId).as('deleteMonitor');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/monitors');
        cy.wait('@getMonitors');
        // Find mocked service monitor and click "Delete" action menu item.
        cy.findByText(monitorLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.actionMenu
                .findByTitle(monitorMenuLabel)
                .should('be.visible')
                .click();
        });
        ui_1.ui.actionMenuItem.findByTitle('Delete').click();
        // Fill out and submit type-to-confirm.
        ui_1.ui.dialog
            .findByTitle("Delete Monitor ".concat(monitorLabel, "?"))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Monitor Name:').should('be.visible').click();
            cy.focused().type(monitorLabel);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete Monitor')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that service monitor is no longer listed.
        cy.wait('@deleteMonitor');
        cy.findByText(noMonitorsMessage).should('be.visible');
    });
});
