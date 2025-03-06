"use strict";
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
/**
 * @file Integration Tests for the CloudPulse Edit Alert Page.
 *
 * This file contains Cypress tests for the Edit Alert page of the CloudPulse application.
 * It ensures that users can navigate to the Edit Alert Page and that alerts are correctly displayed and interactive on the Edit page.
 */
var account_1 = require("support/intercepts/account");
var cloudpulse_1 = require("support/intercepts/cloudpulse");
var databases_1 = require("support/intercepts/databases");
var feature_flags_1 = require("support/intercepts/feature-flags");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var flags = { aclp: { beta: true, enabled: true } };
var expectedResourceIds = Array.from({ length: 50 }, function (_, i) { return String(i + 1); });
var mockAccount = factories_1.accountFactory.build();
var alertDetails = factories_1.alertFactory.build({
    description: 'Test description',
    entity_ids: ['1', '2', '3'],
    label: 'Alert-1',
    service_type: 'dbaas',
    severity: 1,
    status: 'enabled',
    type: 'system',
});
var id = alertDetails.id, label = alertDetails.label, service_type = alertDetails.service_type;
var regions = [
    factories_1.regionFactory.build({
        capabilities: ['Managed Databases'],
        id: 'us-ord',
        label: 'Chicago, IL',
    }),
    factories_1.regionFactory.build({
        capabilities: ['Managed Databases'],
        id: 'us-east',
        label: 'Newark',
    }),
];
var databases = factories_1.databaseFactory
    .buildList(50)
    .map(function (db, index) { return (__assign(__assign({}, db), { engine: 'mysql', region: regions[index % regions.length].id, status: 'active', type: 'MySQL' })); });
var pages = [1, 2];
describe('Integration Tests for Edit Alert', function () {
    /*
     * - Confirms navigation from the Alert Definitions List page to the Edit Alert page.
     * - Confirms alert creation is successful using mock API data.
     * - Confirms that UI handles API interactions and displays correct data.
     * - Confirms that UI redirects back to the Alert Definitions List page after saving updates.
     * - Confirms that a toast notification appears upon successful alert update.
     * - Confirms that UI redirects to the alert listing page after creating an alert.
     * - Confirms that after submitting, the data matches with the API response.
     */
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)(flags);
        (0, account_1.mockGetAccount)(mockAccount);
        (0, regions_1.mockGetRegions)(regions);
        (0, cloudpulse_1.mockGetAllAlertDefinitions)([alertDetails]).as('getAlertDefinitionsList');
        (0, cloudpulse_1.mockGetAlertDefinitions)(service_type, id, alertDetails).as('getAlertDefinitions');
        (0, databases_1.mockGetDatabases)(databases).as('getDatabases');
        (0, cloudpulse_1.mockUpdateAlertDefinitions)(service_type, id, alertDetails).as('updateDefinitions');
    });
    it('should navigate from the Alert Definitions List page to the Edit Alert page', function () {
        // Navigate to the alert definitions list page with login
        cy.visitWithLogin('/monitor/alerts/definitions');
        // Wait for the alert definitions list API call to complete
        cy.wait('@getAlertDefinitionsList');
        // Locate the alert with the specified label in the table
        cy.findByText(label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Alert ".concat(label))
                .should('be.visible')
                .click();
        });
        // Select the "Edit" option from the action menu
        ui_1.ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();
        // Verify the URL ends with the expected details page path
        cy.url().should('endWith', "/edit/".concat(service_type, "/").concat(id));
    });
    it('should correctly display and update the details of the alert in the edit alert page', function () {
        // Navigate to the Edit Alert page
        cy.visitWithLogin("/monitor/alerts/definitions/edit/".concat(service_type, "/").concat(id));
        cy.wait(['@getAlertDefinitions', '@getDatabases']);
        // Verify that the heading with text 'resource' is visible
        ui_1.ui.heading.findByText('resource').should('be.visible');
        // Verify that the heading with text 'region' is visible
        ui_1.ui.heading.findByText('region').should('be.visible');
        // Verify the initial selection of resources, then select all resources.
        cy.findByText('3 of 50 resources are selected.')
            .should('be.visible')
            .closest('[data-qa-notice]')
            .within(function () {
            ui_1.ui.button.findByTitle('Select All').should('be.visible').click();
            ui_1.ui.button
                .findByTitle('Unselect All')
                .should('be.visible')
                .should('be.enabled');
        });
        // Confirm notice text updates to reflect selection.
        cy.findByText('50 of 50 resources are selected.').should('be.visible');
        // Verify the initial state of the page size
        ui_1.ui.pagination.findPageSizeSelect().click();
        // Verify the page size options are visible
        cy.get('[data-qa-pagination-page-size-option="25"]')
            .should('exist')
            .click();
        // Confirm that pagination controls list exactly 4 pages.
        ui_1.ui.pagination
            .findControls()
            .should('be.visible')
            .within(function () {
            pages.forEach(function (page) {
                return cy.findByText("".concat(page)).should('be.visible');
            });
            cy.findByText('5').should('not.exist');
        });
        // Click through each page and confirm correct invoice items are displayed.
        pages.forEach(function (page) {
            databases.slice(25 * (page - 1), 25 * (page - 1) + 24);
            ui_1.ui.pagination.findControls().within(function () {
                cy.findByText("".concat(page)).should('be.visible').click();
            });
        });
        // Change pagination size selection from "Show 25" to "Show 100".
        ui_1.ui.pagination.findPageSizeSelect().click();
        cy.get('[data-qa-pagination-page-size-option="100"]')
            .should('exist')
            .click();
        // Confirm that all invoice items are listed.
        cy.get('tr').should('have.length', 51);
        databases.forEach(function (databaseItem) {
            cy.findByText(databaseItem.label).should('be.visible');
        });
        // Click the Save button
        ui_1.ui.buttonGroup
            .findButtonByTitle('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Click the Cancel button
        cy.get('[data-qa-cancel="true"]').should('be.enabled').should('be.visible');
        // Click the Confirm button
        cy.get('[data-qa-edit-confirmation="true"]')
            .filter('[label="Confirm"]')
            .should('be.visible')
            .click();
        cy.wait('@updateDefinitions').then(function (_a) {
            var request = _a.request, response = _a.response;
            var created_by = alertDetails.created_by, description = alertDetails.description, severity = alertDetails.severity, status = alertDetails.status, type = alertDetails.type, updated_by = alertDetails.updated_by;
            expect(response).to.have.property('statusCode', 200);
            var resourceIds = request.body.entity_ids.map(function (id) {
                return String(id);
            });
            expect(resourceIds.join(',')).to.equal(expectedResourceIds.join(','));
            var alertResponse = response === null || response === void 0 ? void 0 : response.body;
            // Destructure alert_channels and trigger_conditions from alertResponse
            var alert_channels = alertResponse.alert_channels, tags = alertResponse.tags, responseTriggerConditions = alertResponse.trigger_conditions;
            var responseCriteriaCondition = responseTriggerConditions.criteria_condition, responseEvaluationPeriod = responseTriggerConditions.evaluation_period_seconds, responsePollingInterval = responseTriggerConditions.polling_interval_seconds, responseTriggerOccurrences = responseTriggerConditions.trigger_occurrences;
            // Validate basic properties
            expect(alertResponse).to.have.property('id', id);
            expect(alertResponse).to.have.property('label', label);
            expect(alertResponse).to.have.property('type', type);
            expect(alertResponse).to.have.property('status', status);
            expect(alertResponse).to.have.property('service_type', service_type);
            expect(alertResponse).to.have.property('severity', severity);
            expect(alertResponse).to.have.property('description', description);
            expect(alertResponse).to.have.property('created_by', created_by);
            expect(alertResponse).to.have.property('updated_by', updated_by);
            // Validate alert channels
            expect(alert_channels).to.be.an('array').that.has.length(2);
            expect(alert_channels[0]).to.have.property('id', 1);
            expect(alert_channels[0]).to.have.property('label', 'sample1');
            expect(alert_channels[0]).to.have.property('type', 'alert-channel');
            expect(alert_channels[1]).to.have.property('id', 2);
            expect(alert_channels[1]).to.have.property('label', 'sample2');
            expect(alert_channels[1]).to.have.property('type', 'alert-channel');
            // Validate rule criteria
            expect(alertResponse.rule_criteria).to.have.property('rules');
            // Validate trigger conditions
            expect(responseTriggerConditions).to.have.property('criteria_condition', responseCriteriaCondition);
            expect(responseTriggerConditions).to.have.property('evaluation_period_seconds', responseEvaluationPeriod);
            expect(responseTriggerConditions).to.have.property('polling_interval_seconds', responsePollingInterval);
            expect(responseTriggerConditions).to.have.property('trigger_occurrences', responseTriggerOccurrences);
            // Validate tags
            expect(tags).to.include('tag1');
            expect(tags).to.include('tag2');
            // Validate navigation
            cy.url().should('endWith', '/monitor/alerts/definitions');
            // Confirm toast notification appears
            ui_1.ui.toast.assertMessage('Alert resources successfully updated.');
        });
    });
});
