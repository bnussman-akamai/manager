"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Integration Tests for the CloudPulse Alerts Listing Page.
 * This file verifies the UI, functionality, and sorting/filtering of the CloudPulse Alerts Listing Page.
 */
var cloudpulse_1 = require("support/constants/cloudpulse");
var account_1 = require("support/intercepts/account");
var cloudpulse_2 = require("support/intercepts/cloudpulse");
var feature_flags_1 = require("support/intercepts/feature-flags");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var constants_1 = require("src/features/CloudPulse/Alerts/constants");
var formatDate_1 = require("src/utilities/formatDate");
var flags = { aclp: { beta: true, enabled: true } };
var mockAccount = factories_1.accountFactory.build();
var now = new Date();
var mockAlerts = [
    factories_1.alertFactory.build({
        created_by: 'user1',
        label: 'Alert-1',
        service_type: 'dbaas',
        severity: 1,
        status: 'enabled',
        type: 'user',
        updated: new Date(now.getTime() - 86400).toISOString(),
    }),
    factories_1.alertFactory.build({
        created_by: 'user4',
        label: 'Alert-2',
        service_type: 'dbaas',
        severity: 0,
        status: 'disabled',
        type: 'user',
        updated: new Date(now.getTime() - 10 * 86400).toISOString(),
    }),
    factories_1.alertFactory.build({
        created_by: 'user2',
        label: 'Alert-3',
        service_type: 'linode',
        severity: 2,
        status: 'enabled',
        type: 'user',
        updated: new Date(now.getTime() - 6 * 86400).toISOString(),
    }),
    factories_1.alertFactory.build({
        created_by: 'user3',
        label: 'Alert-4',
        service_type: 'linode',
        severity: 3,
        status: 'disabled',
        type: 'user',
        updated: new Date(now.getTime() - 4 * 86400).toISOString(),
    }),
];
/**
 * @description
 * This code validates the presence and correct text of the table headers
 * inside the alert table. It checks if each header matches the expected
 * values as defined in the `expectedHeaders` array.
 *
 * For each header, the code performs the following actions:
 * 1. Locates the table with the `data-qa="alert-table"` attribute.
 * 2. Iterates through the `expectedHeaders` array.
 * 3. For each header, it ensures the table contains a column with the exact header text.
 *
 * @usage
 * This check is typically used in UI tests to ensure that the table headers
 * match the expected structure when displayed in the application.
 */
var expectedHeaders = [
    'Alert Name',
    'Service',
    'Status',
    'Last Modified',
    'Created By',
];
/**
 * Verifies sorting of a column in the alerts table.
 * @param {string} header - The `data-qa-header` attribute of the column to sort.
 * @param {'ascending' | 'descending'} sortOrder - Expected sorting order.
 * @param {number[]} expectedValues - Expected values in sorted order.
 */
var verifyTableSorting = function (header, sortOrder, expectedValues) {
    ui_1.ui.heading.findByText(header).click();
    ui_1.ui.heading.findByText(header).should('have.attr', 'aria-sort', sortOrder);
    cy.get('[data-qa="alert-table"]').within(function () {
        cy.get('[data-qa-alert-cell]').should(function ($cells) {
            var actualOrder = $cells
                .map(function (_, cell) {
                return parseInt(cell.getAttribute('data-qa-alert-cell'), 10);
            })
                .get();
            expectedValues.forEach(function (value, index) {
                expect(actualOrder[index]).to.equal(value);
            });
        });
    });
};
/**
 * @param {Alert} alert - The alert object to validate.
 */
var validateAlertDetails = function (alert) {
    var created_by = alert.created_by, id = alert.id, label = alert.label, service_type = alert.service_type, status = alert.status, updated = alert.updated;
    cy.get("[data-qa-alert-cell=\"".concat(id, "\"]")).within(function () {
        cy.findByText(cloudpulse_1.cloudPulseServiceMap[service_type])
            .should('be.visible')
            .and('have.text', cloudpulse_1.cloudPulseServiceMap[service_type]);
        cy.findByText(constants_1.alertStatuses[status])
            .should('be.visible')
            .and('have.text', constants_1.alertStatuses[status]);
        cy.findByText(label)
            .should('be.visible')
            .and('have.text', label)
            .and('have.attr', 'href', "/monitor/alerts/definitions/detail/".concat(service_type, "/").concat(id));
        cy.findByText((0, formatDate_1.formatDate)(updated, { format: 'MMM dd, yyyy, h:mm a' }))
            .should('be.visible')
            .and('have.text', (0, formatDate_1.formatDate)(updated, { format: 'MMM dd, yyyy, h:mm a' }));
        cy.findByText(created_by).should('be.visible').and('have.text', created_by);
    });
};
describe('Integration Tests for CloudPulse Alerts Listing Page', function () {
    /*
     * - Verifies UI elements, navigation, and alert details in the listing page.
     * - Confirms sorting functionality for multiple columns (Alert Name, Service, Status, Last Modified, Created By).
     * - Validates filtering and search functionality for alerts by name, service, and status.
     * - Ensures users can disable and enable alerts successfully.
     * - Confirms UI properly updates alert statuses after enabling or disabling alerts.
     * - Ensures API calls return correct responses and status codes.
     */
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)(flags);
        (0, account_1.mockGetAccount)(mockAccount);
        (0, cloudpulse_2.mockGetCloudPulseServices)(['linode', 'dbaas']);
        (0, cloudpulse_2.mockGetAllAlertDefinitions)(mockAlerts).as('getAlertDefinitionsList');
        (0, cloudpulse_2.mockUpdateAlertDefinitions)('dbaas', 1, mockAlerts[0]).as('getFirstAlertDefinitions');
        (0, cloudpulse_2.mockUpdateAlertDefinitions)('dbaas', 2, mockAlerts[1]).as('getSecondAlertDefinitions');
        cy.visitWithLogin('/monitor/alerts/definitions');
        cy.wait('@getAlertDefinitionsList');
    });
    it('should verify sorting functionality for multiple columns in ascending and descending order', function () {
        var sortCases = [
            { ascending: [1, 2, 3, 4], column: 'label', descending: [4, 3, 2, 1] },
            { ascending: [2, 4, 1, 3], column: 'status', descending: [1, 3, 2, 4] },
            {
                ascending: [2, 1, 4, 3],
                column: 'service_type',
                descending: [4, 3, 2, 1],
            },
            {
                ascending: [1, 3, 4, 2],
                column: 'created_by',
                descending: [2, 4, 3, 1],
            },
            { ascending: [2, 3, 4, 1], column: 'updated', descending: [1, 4, 3, 2] },
        ];
        sortCases.forEach(function (_a) {
            var ascending = _a.ascending, column = _a.column, descending = _a.descending;
            // Verify descending order
            verifyTableSorting(column, 'descending', descending);
            // Verify ascending order
            verifyTableSorting(column, 'ascending', ascending);
        });
    });
    it('should validate UI elements and alert details', function () {
        // Validate navigation links and buttons
        cy.findByText('Alerts')
            .should('be.visible')
            .and('have.attr', 'href', '/monitor/alerts');
        cy.findByText('Definitions')
            .should('be.visible')
            .and('have.attr', 'href', '/monitor/alerts/definitions');
        ui_1.ui.buttonGroup.findButtonByTitle('Create Alert').should('be.visible');
        // Validate table headers
        cy.get('[data-qa="alert-table"]').within(function () {
            expectedHeaders.forEach(function (header) {
                cy.findByText(header).should('have.text', header);
            });
        });
        // Validate alert details
        mockAlerts.forEach(function (alert) {
            validateAlertDetails(alert);
        });
    });
    it('should search and filter alerts by name, service, and status, and clear filters', function () {
        // Search by alert name and validate the results
        cy.findByPlaceholderText('Search for Alerts')
            .should('be.visible')
            .and('not.be.disabled')
            .type(mockAlerts[0].label);
        cy.get("[data-qa-alert-cell=\"".concat(mockAlerts[0].id, "\"]")).should('be.visible');
        [1, 2, 3].forEach(function (index) {
            cy.get("[data-qa-alert-cell=\"".concat(mockAlerts[index].id, "\"]")).should('not.exist');
        });
        // Clear the previous search by alert name
        cy.get('[data-qa-filter="alert-search"]').within(function () {
            cy.findByTestId('textfield-input').clear();
        });
        // Filter by alert service and validate the results
        cy.findByPlaceholderText('Select a Service')
            .should('be.visible')
            .type('Databases{enter}');
        cy.focused().click();
        cy.get('[data-qa="alert-table"]')
            .find('[data-qa-alert-cell]')
            .should('have.length', 2);
        [0, 1].forEach(function (index) {
            cy.get("[data-qa-alert-cell=\"".concat(mockAlerts[index].id, "\"]")).should('be.visible');
        });
        [2, 3].forEach(function (index) {
            cy.get("[data-qa-alert-cell=\"".concat(mockAlerts[index].id, "\"]")).should('not.exist');
        });
        // Clear the service filter
        cy.get('[data-qa-filter="alert-service-filter"]').within(function () {
            ui_1.ui.button
                .findByAttribute('aria-label', 'Clear')
                .should('be.visible')
                .scrollIntoView();
            ui_1.ui.button.findByAttribute('aria-label', 'Clear').click();
        });
        // Filter by alert status and validate the results
        cy.findByPlaceholderText('Select a Status')
            .should('be.visible')
            .type('Enabled{enter}');
        cy.focused().click();
        cy.get('[data-qa="alert-table"]')
            .find('[data-qa-alert-cell]')
            .should('have.length', 2);
        [0, 2].forEach(function (index) {
            cy.get("[data-qa-alert-cell=\"".concat(mockAlerts[index].id, "\"]")).should('be.visible');
        });
        [1, 3].forEach(function (index) {
            cy.get("[data-qa-alert-cell=\"".concat(mockAlerts[index].id, "\"]")).should('not.exist');
        });
    });
    it('should disable and enable user alerts successfully', function () {
        // Function to search for an alert
        var searchAlert = function (alertName) {
            cy.findByPlaceholderText('Search for Alerts')
                .should('be.visible')
                .and('not.be.disabled')
                .clear();
            cy.findByPlaceholderText('Search for Alerts').type(alertName);
            cy.focused().click();
        };
        // Function to toggle an alert's status
        var toggleAlertStatus = function (alertName, action, alias, successMessage) {
            cy.findByText(alertName)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                ui_1.ui.actionMenu
                    .findByTitle("Action menu for Alert ".concat(alertName))
                    .should('be.visible')
                    .click();
            });
            ui_1.ui.actionMenuItem.findByTitle(action).should('be.visible').click();
            cy.wait(alias).then(function (_a) {
                var response = _a.response;
                ui_1.ui.toast.assertMessage(successMessage);
            });
        };
        // Disable "Alert-1"
        searchAlert('Alert-1');
        toggleAlertStatus('Alert-1', 'Disable', '@getFirstAlertDefinitions', 'Alert disabled');
        // Enable "Alert-2"
        searchAlert('Alert-2');
        toggleAlertStatus('Alert-2', 'Enable', '@getSecondAlertDefinitions', 'Alert enabled');
    });
});
