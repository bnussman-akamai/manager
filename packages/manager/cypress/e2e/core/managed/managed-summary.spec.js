"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var managed_1 = require("support/intercepts/managed");
var managed_2 = require("src/factories/managed");
var managed_3 = require("support/api/managed");
describe('Managed Summary tab', function () {
    /**
     * - Confirms that message is shown when all monitored services are up.
     * - Confirms that number of down monitored services is shown when one or more service is down.
     * - Confirms that number of open support tickets is shown.
     */
    it('shows summary of Managed services', function () {
        var upServiceMonitors = managed_2.monitorFactory.buildList(3, {
            status: 'ok',
        });
        var downServiceMonitors = managed_2.monitorFactory.buildList(3, {
            status: 'problem',
        });
        (0, managed_1.mockGetServiceMonitors)(upServiceMonitors).as('getMonitors');
        (0, managed_1.mockGetIssues)(managed_2.managedIssueFactory.buildList(3)).as('getIssues');
        (0, managed_1.mockGetStats)().as('getStats');
        (0, managed_3.visitUrlWithManagedEnabled)('/managed/summary');
        cy.wait(['@getMonitors', '@getIssues', '@getStats']);
        // Confirm that message is shown describing the good monitor state.
        cy.findByText('All monitored services are up').should('be.visible');
        // Confirm that summary of open support ticket issues is shown.
        cy.findByText('3 open support tickets').should('be.visible');
        // Reload with new mocks.
        (0, managed_1.mockGetServiceMonitors)(downServiceMonitors).as('getMonitors');
        (0, managed_1.mockGetIssues)([]).as('getIssues');
        (0, managed_3.visitUrlWithManagedEnabled)('/managed/summary');
        cy.wait(['@getMonitors', '@getIssues']);
        // Confirm that error is shown containing the number of services that are down.
        cy.findByText('3 monitored services are down').should('be.visible');
        // Confirm that message is shown describing no open support tickets.
        cy.findByText('No open support tickets').should('be.visible');
    });
});
