"use strict";
/**
 * @file Integration Tests for the CloudPulse Edit Alert Page.
 *
 * This file contains Cypress tests for the Edit Alert page of the CloudPulse application.
 * It verifies that alert details are correctly displayed, interactive, and editable.
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
var cloudpulse_1 = require("support/constants/cloudpulse");
var widgets_1 = require("support/constants/widgets");
var account_1 = require("support/intercepts/account");
var cloudpulse_2 = require("support/intercepts/cloudpulse");
var databases_1 = require("support/intercepts/databases");
var feature_flags_1 = require("support/intercepts/feature-flags");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var formatDate_1 = require("src/utilities/formatDate");
// Feature flag setup
var flags = { aclp: { beta: true, enabled: true } };
var mockAccount = factories_1.accountFactory.build();
// Mock alert definition
var customAlertDefinition = factories_1.alertDefinitionFactory.build({
    channel_ids: [1],
    description: 'update-description',
    entity_ids: ['1', '2', '3', '4', '5'],
    label: 'Alert-1',
    rule_criteria: {
        rules: [factories_1.cpuRulesFactory.build(), factories_1.memoryRulesFactory.build()],
    },
    severity: 0,
    tags: [''],
    trigger_conditions: factories_1.triggerConditionFactory.build(),
});
// Mock alert details
var alertDetails = factories_1.alertFactory.build({
    alert_channels: [{ id: 1 }],
    created_by: 'user1',
    description: 'My Custom Description',
    entity_ids: ['2'],
    label: 'Alert-2',
    rule_criteria: {
        rules: [factories_1.cpuRulesFactory.build(), factories_1.memoryRulesFactory.build()],
    },
    service_type: 'dbaas',
    severity: 0,
    tags: [''],
    trigger_conditions: factories_1.triggerConditionFactory.build(),
    type: 'user',
    updated: new Date().toISOString(),
});
var description = alertDetails.description, id = alertDetails.id, label = alertDetails.label, service_type = alertDetails.service_type, updated = alertDetails.updated;
// Mock regions
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
// Mock databases
var databases = factories_1.databaseFactory.buildList(5).map(function (db, index) { return (__assign(__assign({}, db), { engine: 'mysql', id: index, region: regions[index % regions.length].id, status: 'active', type: 'MySQL' })); });
// Mock metric definitions
var metrics = widgets_1.widgetDetails.dbaas.metrics;
var metricDefinitions = metrics.map(function (_a) {
    var name = _a.name, title = _a.title, unit = _a.unit;
    return factories_1.dashboardMetricFactory.build({ label: title, metric: name, unit: unit });
});
// Mock notification channels
var notificationChannels = factories_1.notificationChannelFactory.build({
    channel_type: 'email',
    id: 1,
    label: 'Channel-1',
    type: 'custom',
});
describe('Integration Tests for Edit Alert', function () {
    /*
     * - Confirms that the Edit Alert page loads with the correct alert details.
     * - Verifies that the alert form contains the appropriate pre-filled data from the mock alert.
     * - Confirms that rule criteria values are correctly displayed.
     * - Verifies that the correct notification channel details are displayed.
     * - Ensures the tooltip descriptions for the alert configuration are visible and contain the correct content.
     * - Confirms that the correct regions, databases, and metrics are available for selection in the form.
     * - Verifies that the user can successfully edit and submit changes to the alert.
     * - Confirms that the UI handles updates to alert data correctly and submits them via the API.
     * - Confirms that the API request matches the expected data structure and values upon saving the updated alert.
     * - Verifies that the user is redirected back to the Alert Definitions List page after saving changes.
     * - Ensures a success toast notification appears after the alert is updated.
     * - Confirms that the alert is listed correctly with the updated configuration on the Alert Definitions List page.
     */
    beforeEach(function () {
        // Mocking various API responses
        (0, feature_flags_1.mockAppendFeatureFlags)(flags);
        (0, account_1.mockGetAccount)(mockAccount);
        (0, regions_1.mockGetRegions)(regions);
        (0, cloudpulse_2.mockGetCloudPulseServices)([alertDetails.service_type]);
        (0, cloudpulse_2.mockGetAllAlertDefinitions)([alertDetails]).as('getAlertDefinitionsList');
        (0, cloudpulse_2.mockGetAlertDefinitions)(service_type, id, alertDetails).as('getAlertDefinitions');
        (0, databases_1.mockGetDatabases)(databases).as('getDatabases');
        (0, cloudpulse_2.mockUpdateAlertDefinitions)(service_type, id, alertDetails).as('updateDefinitions');
        (0, cloudpulse_2.mockCreateAlertDefinition)(service_type, customAlertDefinition).as('createAlertDefinition');
        (0, cloudpulse_2.mockGetCloudPulseMetricDefinitions)(service_type, metricDefinitions);
        (0, cloudpulse_2.mockGetAlertChannels)([notificationChannels]);
    });
    // Mapping of interface keys to data attributes
    var fieldSelectors = {
        aggregationType: 'aggregation-type',
        dataField: 'data-field',
        operator: 'operator',
        threshold: 'threshold',
    };
    // Function to assert rule values
    var assertRuleValues = function (ruleIndex, rule) {
        cy.get("[data-testid=\"rule_criteria.rules.".concat(ruleIndex, "-id\"]")).within(function () {
            Object.keys(rule).forEach(function (key) {
                cy.get("[data-qa-metric-threshold=\"rule_criteria.rules.".concat(ruleIndex, "-").concat(fieldSelectors[key], "\"]"))
                    .should('be.visible')
                    .find('input')
                    .should('have.value', rule[key]);
            });
        });
    };
    it('should correctly display the details of the alert in the Edit Alert page', function () {
        cy.visitWithLogin("/monitor/alerts/definitions/edit/".concat(service_type, "/").concat(id));
        cy.wait('@getAlertDefinitions');
        // Verify form fields
        cy.findByLabelText('Name').should('have.value', label);
        cy.findByLabelText('Description (optional)').should('have.value', description);
        cy.findByLabelText('Service')
            .should('be.disabled')
            .should('have.value', 'Databases');
        cy.findByLabelText('Severity').should('have.value', 'Severe');
        // Verify alert resource selection
        cy.get('[data-qa-alert-table="true"]')
            .contains('[data-qa-alert-cell*="resource"]', 'database-3')
            .parents('tr')
            .find('[type="checkbox"]')
            .should('be.checked');
        // Verify alert resource selection count message
        cy.get('[data-testid="selection_notice"]').should('contain', '1 of 5 resources are selected.');
        // Assert rule values 1
        assertRuleValues(0, {
            aggregationType: 'Average',
            dataField: 'CPU Utilization',
            operator: '==',
            threshold: '1000',
        });
        // Assert rule values 2
        assertRuleValues(1, {
            aggregationType: 'Average',
            dataField: 'Memory Usage',
            operator: '==',
            threshold: '1000',
        });
        // Verify that tooltip messages are displayed correctly with accurate content.
        ui_1.ui.tooltip.findByText(cloudpulse_1.METRIC_DESCRIPTION_DATA_FIELD).should('be.visible');
        ui_1.ui.tooltip.findByText(cloudpulse_1.SEVERITY_LEVEL_DESCRIPTION).should('be.visible');
        ui_1.ui.tooltip.findByText(cloudpulse_1.EVALUATION_PERIOD_DESCRIPTION).should('be.visible');
        ui_1.ui.tooltip.findByText(cloudpulse_1.POLLING_INTERVAL_DESCRIPTION).should('be.visible');
        // Assert dimension filters
        var dimensionFilters = [
            { field: 'State of CPU', operator: 'Equal', value: 'User' },
        ];
        dimensionFilters.forEach(function (filter, index) {
            cy.get("[data-qa-dimension-filter=\"rule_criteria.rules.0.dimension_filters.".concat(index, "-data-field\"]"))
                .should('be.visible')
                .find('input')
                .should('have.value', filter.field);
            cy.get("[data-qa-dimension-filter=\"rule_criteria.rules.0.dimension_filters.".concat(index, "-operator\"]"))
                .should('be.visible')
                .find('input')
                .should('have.value', filter.operator);
            cy.get("[data-qa-dimension-filter=\"rule_criteria.rules.0.dimension_filters.".concat(index, "-value\"]"))
                .should('be.visible')
                .find('input')
                .should('have.value', filter.value);
        });
        // Verify notification details
        cy.get('[data-qa-notification="notification-channel-0"]').within(function () {
            cy.get('[data-qa-channel]').should('have.text', 'Channel-1');
            cy.get('[data-qa-type]').next().should('have.text', 'Email');
            cy.get('[data-qa-channel-details]').should('have.text', 'test@test.comtest2@test.com');
        });
    });
    it('successfully updated alert details and verified that the API request matches the expected test data.', function () {
        cy.visitWithLogin("/monitor/alerts/definitions/edit/".concat(service_type, "/").concat(id));
        cy.wait('@getAlertDefinitions');
        // Make changes to alert form
        cy.findByLabelText('Name').clear();
        cy.findByLabelText('Name').type('Alert-2');
        cy.findByLabelText('Description (optional)').clear();
        cy.findByLabelText('Description (optional)').type('update-description');
        cy.findByLabelText('Service').should('be.disabled');
        ui_1.ui.autocomplete.findByLabel('Severity').clear();
        ui_1.ui.autocomplete.findByLabel('Severity').type('Info');
        ui_1.ui.autocompletePopper.findByTitle('Info').should('be.visible').click();
        cy.get('[data-qa-notice="true"]')
            .find('button')
            .contains('Select All')
            .click();
        cy.get('[data-qa-metric-threshold="rule_criteria.rules.0-data-field"]').within(function () {
            ui_1.ui.button.findByAttribute('aria-label', 'Clear').click();
        });
        cy.get('[data-testid="rule_criteria.rules.0-id"]').within(function () {
            ui_1.ui.autocomplete.findByLabel('Data Field').type('Disk I/O');
            ui_1.ui.autocompletePopper.findByTitle('Disk I/O').click();
            ui_1.ui.autocomplete.findByLabel('Aggregation Type').type('Minimum');
            ui_1.ui.autocompletePopper.findByTitle('Minimum').click();
            ui_1.ui.autocomplete.findByLabel('Operator').type('>');
            ui_1.ui.autocompletePopper.findByTitle('>').click();
            cy.get('[data-qa-threshold]').should('be.visible').clear();
            cy.get('[data-qa-threshold]').should('be.visible').type('2000');
        });
        // click on the submit button
        ui_1.ui.buttonGroup
            .find()
            .find('button')
            .filter('[type="submit"]')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@updateDefinitions').then(function (_a) {
            var request = _a.request;
            // Assert the API request data
            expect(request.body.label).to.equal('Alert-2');
            expect(request.body.description).to.equal('update-description');
            expect(request.body.severity).to.equal(3);
            expect(request.body.entity_ids).to.have.members([
                '0',
                '1',
                '2',
                '3',
                '4',
            ]);
            expect(request.body.channel_ids[0]).to.equal(1);
            expect(request.body).to.have.property('trigger_conditions');
            expect(request.body.trigger_conditions.criteria_condition).to.equal('ALL');
            expect(request.body.trigger_conditions.evaluation_period_seconds).to.equal(300);
            expect(request.body.trigger_conditions.polling_interval_seconds).to.equal(300);
            expect(request.body.trigger_conditions.trigger_occurrences).to.equal(5);
            expect(request.body.rule_criteria.rules[0].threshold).to.equal(2000);
            expect(request.body.rule_criteria.rules[0].operator).to.equal('gt');
            expect(request.body.rule_criteria.rules[0].aggregate_function).to.equal('min');
            expect(request.body.rule_criteria.rules[0].metric).to.equal('system_disk_OPS_total');
            expect(request.body.rule_criteria.rules[1].aggregate_function).to.equal('avg');
            expect(request.body.rule_criteria.rules[1].metric).to.equal('system_memory_usage_by_resource');
            expect(request.body.rule_criteria.rules[1].operator).to.equal('eq');
            expect(request.body.rule_criteria.rules[1].threshold).to.equal(1000);
            // Verify URL redirection and toast notification
            cy.url().should('endWith', 'monitor/alerts/definitions');
            ui_1.ui.toast.assertMessage('Alert successfully updated.');
            // Confirm that Alert is listed on landing page with expected configuration.
            cy.findByText('Alert-2')
                .closest('tr')
                .within(function () {
                cy.findByText('Alert-2').should('be.visible');
                cy.findByText('Enabled').should('be.visible');
                cy.findByText('Databases').should('be.visible');
                cy.findByText('user1').should('be.visible');
                cy.findByText((0, formatDate_1.formatDate)(updated, { format: 'MMM dd, yyyy, h:mm a' })).should('be.visible');
            });
        });
    });
});
