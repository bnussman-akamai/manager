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
 * @file Integration Tests for the CloudPulse Alerts Show Detail Page.
 *
 * This file contains Cypress tests that validate the display and content of the  Alerts Show Detail Page in the CloudPulse application.
 * It ensures that all alert details, criteria, and resource information are displayed correctly.
 */
var utilities_1 = require("@linode/utilities");
var alert_1 = require("support/constants/alert");
var account_1 = require("support/intercepts/account");
var cloudpulse_1 = require("support/intercepts/cloudpulse");
var databases_1 = require("support/intercepts/databases");
var feature_flags_1 = require("support/intercepts/feature-flags");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var formatDate_1 = require("src/utilities/formatDate");
var flags = { aclp: { beta: true, enabled: true } };
var mockAccount = factories_1.accountFactory.build();
var regions = [
    factories_1.regionFactory.build({
        capabilities: ['Managed Databases'],
        country: 'us',
        id: 'us-ord',
        label: 'Chicago, IL',
    }),
    factories_1.regionFactory.build({
        capabilities: ['Managed Databases'],
        country: 'us',
        id: 'us-east',
        label: 'Newark',
    }),
];
var databases = factories_1.databaseFactory.buildList(5).map(function (db, index) { return (__assign(__assign({}, db), { engine: 'mysql', region: regions[index % regions.length].id, type: 'MySQL' })); });
var alertDetails = factories_1.alertFactory.build({
    entity_ids: databases.slice(0, 4).map(function (db) { return db.id.toString(); }),
    rule_criteria: { rules: factories_1.alertRulesFactory.buildList(2) },
    service_type: 'dbaas',
    severity: 1,
    status: 'enabled',
    type: 'system',
});
var created_by = alertDetails.created_by, description = alertDetails.description, id = alertDetails.id, label = alertDetails.label, rule_criteria = alertDetails.rule_criteria, service_type = alertDetails.service_type, severity = alertDetails.severity, updated = alertDetails.updated;
var rules = rule_criteria.rules;
var notificationChannels = factories_1.notificationChannelFactory.build();
var verifyRowOrder = function (expectedIds) {
    cy.get('[data-qa-alert-row]').then(function ($rows) {
        var alertRowIds = $rows
            .map(function (index, row) { return row.getAttribute('data-qa-alert-row'); })
            .get();
        expectedIds.forEach(function (expectedId, index) {
            expect(alertRowIds[index]).to.equal(expectedId);
        });
    });
};
/**
 * Integration tests for the CloudPulse Alerts Detail Page, ensuring that the alert details, criteria, and resource information are correctly displayed and validated, including various fields like name, description, status, severity, and trigger conditions.
 */
describe('Integration Tests for Alert Show Detail Page', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)(flags);
        (0, account_1.mockGetAccount)(mockAccount);
        (0, regions_1.mockGetRegions)(regions);
        (0, cloudpulse_1.mockGetAllAlertDefinitions)([alertDetails]).as('getAlertDefinitionsList');
        (0, cloudpulse_1.mockGetAlertDefinitions)(service_type, id, alertDetails).as('getDBaaSAlertDefinitions');
        (0, databases_1.mockGetDatabases)(databases).as('getMockedDbaasDatabases');
        (0, cloudpulse_1.mockGetAlertChannels)([notificationChannels]);
    });
    it('navigates to the Show Details page from the list page', function () {
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
        // Select the "Show Details" option from the action menu
        ui_1.ui.actionMenuItem.findByTitle('Show Details').should('be.visible').click();
        // Verify the URL ends with the expected details page path
        cy.url().should('endWith', "/detail/".concat(service_type, "/").concat(id));
    });
    it('should correctly display the details of the DBaaS alert in the alert details view', function () {
        cy.visitWithLogin("/monitor/alerts/definitions/detail/".concat(service_type, "/").concat(id));
        cy.wait(['@getDBaaSAlertDefinitions', '@getMockedDbaasDatabases']);
        // Validating contents of Overview Section
        cy.get('[data-qa-section="Overview"]').within(function () {
            // Validate Name field
            cy.findByText('Name:').should('be.visible');
            cy.findByText(label).should('be.visible');
            // Validate Description field
            cy.findByText('Description:').should('be.visible');
            cy.findByText(description).should('be.visible');
            // Validate Status field
            cy.findByText('Status:').should('be.visible');
            cy.findByText('Enabled').should('be.visible');
            cy.findByText('Severity:').should('be.visible');
            cy.findByText(alert_1.severityMap[severity]).should('be.visible');
            // Validate Service field
            cy.findByText('Service:').should('be.visible');
            cy.findByText('Databases').should('be.visible');
            // Validate Type field
            cy.findByText('Type:').should('be.visible');
            cy.findByText('System').should('be.visible');
            // Validate Created By field
            cy.findByText('Created By:').should('be.visible');
            cy.findByText(created_by).should('be.visible');
            // Validate Last Modified field
            cy.findByText('Last Modified:').should('be.visible');
            cy.findByText((0, formatDate_1.formatDate)(updated, {
                format: 'MMM dd, yyyy, h:mm a',
            })).should('be.visible');
        });
        // Validating contents of Criteria Section
        cy.get('[data-qa-section="Criteria"]').within(function () {
            rules.forEach(function (rule, index) {
                cy.get('[data-qa-item="Metric Threshold"]')
                    .eq(index)
                    .within(function () {
                    cy.get("[data-qa-chip=\"".concat(alert_1.aggregationTypeMap[rule.aggregate_function], "\"]"))
                        .should('be.visible')
                        .should('have.text', alert_1.aggregationTypeMap[rule.aggregate_function]);
                    cy.get("[data-qa-chip=\"".concat(rule.label, "\"]"))
                        .should('be.visible')
                        .should('have.text', rule.label);
                    cy.get("[data-qa-chip=\"".concat(alert_1.metricOperatorTypeMap[rule.operator], "\"]"))
                        .should('be.visible')
                        .should('have.text', alert_1.metricOperatorTypeMap[rule.operator]);
                    cy.get("[data-qa-chip=\"".concat(rule.threshold, "\"]"))
                        .should('be.visible')
                        .should('have.text', rule.threshold);
                    cy.get("[data-qa-chip=\"".concat(rule.unit, "\"]"))
                        .should('be.visible')
                        .should('have.text', rule.unit);
                });
                // Validating contents of Dimension Filter
                cy.get('[data-qa-item="Dimension Filter"]')
                    .eq(index)
                    .within(function () {
                    var _a;
                    ((_a = rule.dimension_filters) !== null && _a !== void 0 ? _a : []).forEach(function (filter, filterIndex) {
                        // Validate the filter label
                        cy.get("[data-qa-chip=\"".concat(filter.label, "\"]"))
                            .should('be.visible')
                            .each(function ($chip) {
                            expect($chip).to.have.text(filter.label);
                        });
                        // Validate the filter operator
                        cy.get("[data-qa-chip=\"".concat(alert_1.dimensionOperatorTypeMap[filter.operator], "\"]"))
                            .should('be.visible')
                            .each(function ($chip) {
                            expect($chip).to.have.text(alert_1.dimensionOperatorTypeMap[filter.operator]);
                        });
                        // Validate the filter value
                        cy.get("[data-qa-chip=\"".concat((0, utilities_1.capitalize)(filter.value), "\"]"))
                            .should('be.visible')
                            .each(function ($chip) {
                            expect($chip).to.have.text((0, utilities_1.capitalize)(filter.value));
                        });
                    });
                });
            });
            // Validating contents of Polling Interval
            cy.get('[data-qa-item="Polling Interval"]')
                .find('[data-qa-chip]')
                .should('be.visible')
                .should('have.text', '10 minutes');
            // Validating contents of Evaluation Periods
            cy.get('[data-qa-item="Evaluation Period"]')
                .find('[data-qa-chip]')
                .should('be.visible')
                .should('have.text', '5 minutes');
            // Validating contents of Trigger Alert
            cy.get('[data-qa-chip="All"]')
                .should('be.visible')
                .should('have.text', 'All');
            cy.get('[data-qa-chip="5 minutes"]')
                .should('be.visible')
                .should('have.text', '5 minutes');
            cy.get('[data-qa-item="criteria are met for"]')
                .should('be.visible')
                .should('have.text', 'criteria are met for');
            cy.get('[data-qa-item="consecutive occurrences"]')
                .should('be.visible')
                .should('have.text', 'consecutive occurrences.');
        });
        //  Validate the Resources section (Resource and Region columns)
        cy.get('[data-qa-section="Resources"]').within(function () {
            ui_1.ui.heading
                .findByText('resource')
                .scrollIntoView()
                .should('be.visible')
                .should('have.text', 'Resource');
            ui_1.ui.heading
                .findByText('region')
                .should('be.visible')
                .should('have.text', 'Region');
            cy.findByPlaceholderText('Search for a Region or Resource').should('be.visible');
            cy.findByPlaceholderText('Select Regions').should('be.visible');
            cy.get('[data-qa-alert-row]').should('have.length', 4);
            // Validate resource-region mapping for each row in the table
            var regionMap = new Map(regions.map(function (r) { return [r.id, r.label]; }));
            cy.get('[data-qa-alert-row]')
                .should('have.length', 4)
                .each(function (row, index) {
                var db = databases[index];
                var rowNumber = index + 1;
                var regionLabel = regionMap.get(db.region) || 'Unknown Region';
                cy.wrap(row).within(function () {
                    cy.get("[data-qa-alert-cell=\"".concat(rowNumber, "_resource\"]")).should('have.text', db.label);
                    cy.get("[data-qa-alert-cell=\"".concat(rowNumber, "_region\"]")).should('have.text', "US, ".concat(regionLabel, " (").concat(db.region, ")"));
                });
            });
            // Sorting by Resource and Region columns
            ui_1.ui.heading.findByText('resource').should('be.visible').click();
            verifyRowOrder(['4', '3', '2', '1']);
            ui_1.ui.heading.findByText('resource').should('be.visible').click();
            verifyRowOrder(['1', '2', '3', '4']);
            ui_1.ui.heading.findByText('region').should('be.visible').click();
            verifyRowOrder(['2', '4', '1', '3']);
            ui_1.ui.heading.findByText('region').should('be.visible').click();
            verifyRowOrder(['1', '3', '2', '4']);
            // Search by Resource
            cy.findByPlaceholderText('Search for a Region or Resource')
                .should('be.visible')
                .type(databases[0].label);
            cy.get('[data-qa-alert-table="true"]')
                .find('[data-qa-alert-row]')
                .should('have.length', 1);
            cy.findByText(databases[0].label).should('be.visible');
            [1, 2, 3].forEach(function (i) {
                return cy.findByText(databases[i].label).should('not.exist');
            });
            // Search by region
            cy.findByPlaceholderText('Search for a Region or Resource').clear();
            ui_1.ui.regionSelect.find().click().type("".concat(regions[0].label, "{enter}"));
            ui_1.ui.regionSelect.find().click();
            cy.get('[data-qa-alert-table="true"]')
                .find('[data-qa-alert-row]')
                .should('have.length', 2);
            [0, 2].forEach(function (i) {
                return cy.get("[data-qa-alert-cell=\"".concat(i, "_region\"]")).should('not.exist');
            });
            [1, 3].forEach(function (i) {
                return cy.get("[data-qa-alert-cell=\"".concat(i, "_region\"]")).should('be.visible');
            });
        });
        // Validate Notification Channels Section
        cy.get('[data-qa-section="Notification Channels"]').within(function () {
            cy.findByText('Type:').should('be.visible');
            cy.findByText('Email').should('be.visible');
            cy.findByText('Channel:').should('be.visible');
            cy.findByText('Channel-1').should('be.visible');
            cy.findByText('To:').should('be.visible');
            cy.findByText('test@test.com').should('be.visible');
            cy.findByText('test2@test.com').should('be.visible');
        });
    });
});
