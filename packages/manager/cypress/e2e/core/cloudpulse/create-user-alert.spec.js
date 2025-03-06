"use strict";
/**
 * @fileoverview Cypress test suite for the "Create Alert" functionality.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var alert_1 = require("support/constants/alert");
var widgets_1 = require("support/constants/widgets");
var account_1 = require("support/intercepts/account");
var cloudpulse_1 = require("support/intercepts/cloudpulse");
var databases_1 = require("support/intercepts/databases");
var feature_flags_1 = require("support/intercepts/feature-flags");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var formatDate_1 = require("src/utilities/formatDate");
var flags = { aclp: { beta: true, enabled: true } };
// Create mock data
var mockAccount = factories_1.accountFactory.build();
var mockRegion = factories_1.regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-ord',
    label: 'Chicago, IL',
});
var _a = widgets_1.widgetDetails.dbaas, metrics = _a.metrics, serviceType = _a.serviceType;
var databaseMock = factories_1.databaseFactory.buildList(10, {
    cluster_size: 3,
    engine: 'mysql',
    region: 'us-ord',
});
var notificationChannels = factories_1.notificationChannelFactory.build({
    channel_type: 'email',
    id: 1,
    label: 'channel-1',
    type: 'custom',
});
var customAlertDefinition = factories_1.alertDefinitionFactory.build({
    channel_ids: [1],
    description: 'My Custom Description',
    entity_ids: ['2'],
    label: 'Alert-1',
    rule_criteria: {
        rules: [factories_1.cpuRulesFactory.build(), factories_1.memoryRulesFactory.build()],
    },
    severity: 0,
    tags: [''],
    trigger_conditions: factories_1.triggerConditionFactory.build(),
});
var metricDefinitions = metrics.map(function (_a) {
    var name = _a.name, title = _a.title, unit = _a.unit;
    return factories_1.dashboardMetricFactory.build({
        label: title,
        metric: name,
        unit: unit,
    });
});
var mockAlerts = factories_1.alertFactory.build({
    alert_channels: [{ id: 1 }],
    created_by: 'user1',
    description: 'My Custom Description',
    entity_ids: ['2'],
    label: 'Alert-1',
    rule_criteria: {
        rules: [factories_1.cpuRulesFactory.build(), factories_1.memoryRulesFactory.build()],
    },
    service_type: 'dbaas',
    severity: 0,
    tags: [''],
    trigger_conditions: factories_1.triggerConditionFactory.build(),
    updated: new Date().toISOString(),
});
/**
 * Fills metric details in the form.
 * @param ruleIndex - The index of the rule to fill.
 * @param dataField - The metric's data field (e.g., "CPU Utilization").
 * @param aggregationType - The aggregation type (e.g., "Average").
 * @param operator - The operator (e.g., ">=", "==").
 * @param threshold - The threshold value for the metric.
 */
var fillMetricDetailsForSpecificRule = function (_a) {
    var aggregationType = _a.aggregationType, dataField = _a.dataField, operator = _a.operator, ruleIndex = _a.ruleIndex, threshold = _a.threshold;
    cy.get("[data-testid=\"rule_criteria.rules.".concat(ruleIndex, "-id\"]")).within(function () {
        // Fill Data Field
        ui_1.ui.autocomplete
            .findByLabel('Data Field')
            .should('be.visible')
            .type(dataField);
        ui_1.ui.autocompletePopper.findByTitle(dataField).should('be.visible').click();
        // Validate Aggregation Type
        ui_1.ui.autocomplete
            .findByLabel('Aggregation Type')
            .should('be.visible')
            .type(aggregationType);
        ui_1.ui.autocompletePopper
            .findByTitle(aggregationType)
            .should('be.visible')
            .click();
        // Fill Operator
        ui_1.ui.autocomplete.findByLabel('Operator').should('be.visible').type(operator);
        ui_1.ui.autocompletePopper.findByTitle(operator).should('be.visible').click();
        // Fill Threshold
        cy.get('[data-qa-threshold]').should('be.visible').clear();
        cy.get('[data-qa-threshold]').should('be.visible').type(threshold);
    });
};
describe('Create Alert', function () {
    /*
     * - Confirms that users can navigate from the Alert Listings page to the Create Alert page.
     * - Confirms that users can enter alert details, select resources, and configure conditions.
     * - Confirms that the UI allows adding notification channels and setting thresholds.
     * - Confirms client-side validation when entering invalid metric values.
     * - Confirms that API interactions work correctly and return the expected responses.
     * - Confirms that the UI displays a success message after creating an alert.
     */
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)(flags);
        (0, account_1.mockGetAccount)(mockAccount);
        (0, cloudpulse_1.mockGetCloudPulseServices)([serviceType]);
        (0, regions_1.mockGetRegions)([mockRegion]);
        (0, cloudpulse_1.mockGetCloudPulseMetricDefinitions)(serviceType, metricDefinitions);
        (0, databases_1.mockGetDatabases)(databaseMock);
        (0, cloudpulse_1.mockGetAllAlertDefinitions)([mockAlerts]).as('getAlertDefinitionsList');
        (0, cloudpulse_1.mockGetAlertChannels)([notificationChannels]);
        (0, cloudpulse_1.mockCreateAlertDefinition)(serviceType, customAlertDefinition).as('createAlertDefinition');
    });
    it('should navigate to the Create Alert page from the Alert Listings page', function () {
        // Navigate to the alert definitions list page with login
        cy.visitWithLogin('/monitor/alerts/definitions');
        // Wait for the alert definitions list API call to complete
        cy.wait('@getAlertDefinitionsList');
        ui_1.ui.buttonGroup
            .findButtonByTitle('Create Alert')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Verify the URL ends with the expected details page path
        cy.url().should('endWith', 'monitor/alerts/definitions/create');
    });
    it('should successfully create a new alert', function () {
        var _a;
        cy.visitWithLogin('monitor/alerts/definitions/create');
        // Enter Name and Description
        cy.findByPlaceholderText('Enter Name')
            .should('be.visible')
            .type(customAlertDefinition.label);
        cy.findByPlaceholderText('Enter Description')
            .should('be.visible')
            .type((_a = customAlertDefinition.description) !== null && _a !== void 0 ? _a : '');
        // Select Service
        ui_1.ui.autocomplete
            .findByLabel('Service')
            .should('be.visible')
            .type('Databases');
        ui_1.ui.autocompletePopper.findByTitle('Databases').should('be.visible').click();
        // Select Severity
        ui_1.ui.autocomplete.findByLabel('Severity').should('be.visible').type('Severe');
        ui_1.ui.autocompletePopper.findByTitle('Severe').should('be.visible').click();
        // Search for Resource
        cy.findByPlaceholderText('Search for a Region or Resource')
            .should('be.visible')
            .type('database-2');
        // Find the table and locate the resource cell containing 'database-2', then check the corresponding checkbox
        cy.get('[data-qa-alert-table="true"]') // Find the table
            .contains('[data-qa-alert-cell*="resource"]', 'database-2') // Find resource cell
            .parents('tr')
            .find('[type="checkbox"]')
            .check();
        // Assert resource selection notice
        cy.findByText('1 of 10 resources are selected.');
        // Fill metric details for the first rule
        var cpuUsageMetricDetails = {
            aggregationType: 'Average',
            dataField: 'CPU Utilization',
            operator: '==',
            ruleIndex: 0,
            threshold: '1000',
        };
        fillMetricDetailsForSpecificRule(cpuUsageMetricDetails);
        // Add metrics
        cy.findByRole('button', { name: 'Add metric' })
            .should('be.visible')
            .click();
        ui_1.ui.buttonGroup
            .findButtonByTitle('Add dimension filter')
            .should('be.visible')
            .click();
        ui_1.ui.autocomplete
            .findByLabel('Data Field')
            .eq(1)
            .should('be.visible')
            .clear();
        ui_1.ui.autocomplete
            .findByLabel('Data Field')
            .eq(1)
            .should('be.visible')
            .type('State of CPU');
        cy.findByText('State of CPU').should('be.visible').click();
        ui_1.ui.autocomplete.findByLabel('Operator').eq(1).should('be.visible').clear();
        ui_1.ui.autocomplete.findByLabel('Operator').eq(1).type('Equal');
        cy.findByText('Equal').should('be.visible').click();
        ui_1.ui.autocomplete.findByLabel('Value').should('be.visible').type('User');
        cy.findByText('User').should('be.visible').click();
        // Fill metric details for the second rule
        var memoryUsageMetricDetails = {
            aggregationType: 'Average',
            dataField: 'Memory Usage',
            operator: '==',
            ruleIndex: 1,
            threshold: '1000',
        };
        fillMetricDetailsForSpecificRule(memoryUsageMetricDetails);
        // Set evaluation period
        ui_1.ui.autocomplete
            .findByLabel('Evaluation Period')
            .should('be.visible')
            .type('5 min');
        ui_1.ui.autocompletePopper.findByTitle('5 min').should('be.visible').click();
        // Set polling interval
        ui_1.ui.autocomplete
            .findByLabel('Polling Interval')
            .should('be.visible')
            .type('5 min');
        ui_1.ui.autocompletePopper.findByTitle('5 min').should('be.visible').click();
        // Set trigger occurrences
        cy.get('[data-qa-trigger-occurrences]').should('be.visible').clear();
        cy.get('[data-qa-trigger-occurrences]').should('be.visible').type('5');
        // Add notification channel
        ui_1.ui.buttonGroup.find().contains('Add notification channel').click();
        ui_1.ui.autocomplete.findByLabel('Type').should('be.visible').type('Email');
        ui_1.ui.autocompletePopper.findByTitle('Email').should('be.visible').click();
        ui_1.ui.autocomplete
            .findByLabel('Channel')
            .should('be.visible')
            .type('channel-1');
        ui_1.ui.autocompletePopper.findByTitle('channel-1').should('be.visible').click();
        // Add channel
        ui_1.ui.drawer
            .findByTitle('Add Notification Channel')
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add channel')
                .should('be.visible')
                .click();
        });
        // Click on submit button
        ui_1.ui.buttonGroup
            .find()
            .find('button')
            .filter('[type="submit"]')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createAlertDefinition').then(function (_a) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            var request = _a.request;
            var description = customAlertDefinition.description, label = customAlertDefinition.label, rules = customAlertDefinition.rule_criteria.rules, severity = customAlertDefinition.severity, _s = customAlertDefinition.trigger_conditions, criteria_condition = _s.criteria_condition, evaluation_period_seconds = _s.evaluation_period_seconds, polling_interval_seconds = _s.polling_interval_seconds, trigger_occurrences = _s.trigger_occurrences;
            var created_by = mockAlerts.created_by, status = mockAlerts.status, updated = mockAlerts.updated;
            // Validate top-level properties
            expect(request.body.label).to.equal(label);
            expect(request.body.description).to.equal(description);
            expect(request.body.severity).to.equal(severity);
            // Validate rule criteria
            expect(request.body.rule_criteria).to.have.property('rules');
            expect(request.body.rule_criteria.rules)
                .to.be.an('array')
                .with.length(rules.length);
            // Validate first rule
            var firstRule = request.body.rule_criteria.rules[0];
            var firstCustomRule = rules[0];
            expect(firstRule.aggregate_function).to.equal(firstCustomRule.aggregate_function);
            expect(firstRule.metric).to.equal(firstCustomRule.metric);
            expect(firstRule.operator).to.equal(firstCustomRule.operator);
            expect(firstRule.threshold).to.equal(firstCustomRule.threshold);
            expect((_c = (_b = firstRule.dimension_filters[0]) === null || _b === void 0 ? void 0 : _b.dimension_label) !== null && _c !== void 0 ? _c : '').to.equal((_f = (_e = (_d = firstCustomRule.dimension_filters) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.dimension_label) !== null && _f !== void 0 ? _f : '');
            expect((_h = (_g = firstRule.dimension_filters[0]) === null || _g === void 0 ? void 0 : _g.operator) !== null && _h !== void 0 ? _h : '').to.equal((_l = (_k = (_j = firstCustomRule.dimension_filters) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.operator) !== null && _l !== void 0 ? _l : '');
            expect((_o = (_m = firstRule.dimension_filters[0]) === null || _m === void 0 ? void 0 : _m.value) !== null && _o !== void 0 ? _o : '').to.equal((_r = (_q = (_p = firstCustomRule.dimension_filters) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.value) !== null && _r !== void 0 ? _r : '');
            // Validate second rule
            var secondRule = request.body.rule_criteria.rules[1];
            var secondCustomRule = rules[1];
            expect(secondRule.aggregate_function).to.equal(secondCustomRule.aggregate_function);
            expect(secondRule.metric).to.equal(secondCustomRule.metric);
            expect(secondRule.operator).to.equal(secondCustomRule.operator);
            expect(secondRule.threshold).to.equal(secondCustomRule.threshold);
            // Validate trigger conditions
            var triggerConditions = request.body.trigger_conditions;
            expect(triggerConditions.trigger_occurrences).to.equal(trigger_occurrences);
            expect(triggerConditions.evaluation_period_seconds).to.equal(evaluation_period_seconds);
            expect(triggerConditions.polling_interval_seconds).to.equal(polling_interval_seconds);
            expect(triggerConditions.criteria_condition).to.equal(criteria_condition);
            // Validate entity IDs and channels
            expect(request.body.entity_ids).to.include('2');
            expect(request.body.channel_ids).to.include(1);
            // Verify URL redirection and toast notification
            cy.url().should('endWith', 'monitor/alerts/definitions');
            ui_1.ui.toast.assertMessage('Alert successfully created');
            // Confirm that Alert is listed on landing page with expected configuration.
            cy.findByText(label)
                .closest('tr')
                .within(function () {
                cy.findByText(label).should('be.visible');
                cy.findByText(alert_1.statusMap[status]).should('be.visible');
                cy.findByText('Databases').should('be.visible');
                cy.findByText(created_by).should('be.visible');
                cy.findByText((0, formatDate_1.formatDate)(updated, { format: 'MMM dd, yyyy, h:mm a' }));
            });
        });
    });
});
