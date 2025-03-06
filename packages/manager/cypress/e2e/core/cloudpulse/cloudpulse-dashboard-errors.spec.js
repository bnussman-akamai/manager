"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Error Handling Tests for CloudPulse Dashboard.
 */
var widgets_1 = require("support/constants/widgets");
var account_1 = require("support/intercepts/account");
var cloudpulse_1 = require("support/intercepts/cloudpulse");
var databases_1 = require("support/intercepts/databases");
var feature_flags_1 = require("support/intercepts/feature-flags");
var profile_1 = require("support/intercepts/profile");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
/**
 * Verifies the presence and values of specific properties within the aclpPreference object
 * of the request payload. This function checks that the expected properties exist
 * and have the expected values, allowing for validation of user preferences in the application.
 *
 * @param requestPayload - The payload received from the request, containing the aclpPreference object.
 * @param expectedValues - An object containing the expected values for properties to validate against the requestPayload.
 */
var flags = {
    aclp: { beta: true, enabled: true },
    aclpResourceTypeMap: [
        {
            dimensionKey: 'LINODE_ID',
            maxResourceSelections: 10,
            serviceType: 'linode',
            supportedRegionIds: 'us-ord',
        },
        {
            dimensionKey: 'cluster_id',
            maxResourceSelections: 10,
            serviceType: 'dbaas',
            supportedRegionIds: 'us-ord',
        },
    ],
};
var _a = widgets_1.widgetDetails.dbaas, clusterName = _a.clusterName, dashboardName = _a.dashboardName, engine = _a.engine, id = _a.id, metrics = _a.metrics, nodeType = _a.nodeType, serviceType = _a.serviceType;
var dashboard = factories_1.dashboardFactory.build({
    label: dashboardName,
    service_type: serviceType,
    widgets: metrics.map(function (_a) {
        var name = _a.name, title = _a.title, unit = _a.unit, yLabel = _a.yLabel;
        return factories_1.widgetFactory.build({
            label: title,
            metric: name,
            unit: unit,
            y_label: yLabel,
        });
    }),
});
var metricDefinitions = metrics.map(function (_a) {
    var name = _a.name, title = _a.title, unit = _a.unit;
    return factories_1.dashboardMetricFactory.build({
        label: title,
        metric: name,
        unit: unit,
    });
});
var mockRegion = factories_1.regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-ord',
    label: 'Chicago, IL',
});
var databaseMock = factories_1.databaseFactory.build({
    cluster_size: 3,
    engine: 'mysql',
    label: clusterName,
    region: mockRegion.id,
    status: 'provisioning',
    type: engine,
    version: '1',
});
var mockAccount = factories_1.accountFactory.build();
describe('Tests for API error handling', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)(flags);
        (0, account_1.mockGetAccount)(mockAccount);
        (0, cloudpulse_1.mockGetCloudPulseMetricDefinitions)(serviceType, metricDefinitions);
        (0, cloudpulse_1.mockGetCloudPulseDashboards)(serviceType, [dashboard]).as('fetchDashboard');
        (0, cloudpulse_1.mockGetCloudPulseServices)([serviceType]).as('fetchServices');
        (0, cloudpulse_1.mockCreateCloudPulseJWEToken)(serviceType);
        (0, cloudpulse_1.mockGetCloudPulseDashboard)(id, dashboard);
        (0, regions_1.mockGetRegions)([mockRegion]);
        (0, profile_1.mockGetUserPreferences)({});
        (0, databases_1.mockGetDatabases)([databaseMock]).as('getDatabases');
    });
    it('displays error message when metric definitions API fails', function () {
        // Mocking an error response for the 'getMetricDefinitions' API request related to a specific service type.
        (0, cloudpulse_1.mockGetCloudPulseMetricDefinitionsError)(serviceType, 'Internal Server Error').as('getMetricDefinitions');
        cy.visitWithLogin('monitor/cloudpulse');
        // Wait for the API calls .
        cy.wait(['@fetchServices', '@fetchDashboard']);
        // Selecting a dashboard from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Dashboard')
            .should('be.visible')
            .type(dashboardName);
        ui_1.ui.autocompletePopper
            .findByTitle(dashboardName)
            .should('be.visible')
            .click();
        // Select a Database Engine from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Database Engine')
            .should('be.visible')
            .type(engine);
        ui_1.ui.autocompletePopper.findByTitle(engine).should('be.visible').click();
        //  Select a region from the dropdown.
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect
            .findItemByRegionId(mockRegion.id, [mockRegion])
            .should('be.visible')
            .click();
        // Select a resource (Database Clusters) from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Database Clusters')
            .should('be.visible')
            .type(clusterName);
        ui_1.ui.autocompletePopper.findByTitle(clusterName).should('be.visible').click();
        ui_1.ui.button
            .findByAttribute('aria-label', 'Close')
            .should('be.visible')
            .click();
        // Select a Node from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Node Type')
            .should('be.visible')
            .type("".concat(nodeType, "{enter}"));
        // Wait for the API calls .
        cy.wait('@getMetricDefinitions');
        cy.get('[data-qa-error-msg="true"]')
            .should('be.visible')
            .should('have.text', 'Error loading the definitions of metrics.');
    });
    it('displays error message when services API fails', function () {
        // Mocking an error response for the 'fetchServices' API request.
        (0, cloudpulse_1.mockGetCloudPulseServicesError)('Internal Server Error').as('fetchServices');
        cy.visitWithLogin('monitor/cloudpulse');
        // Wait for the API calls .
        cy.wait('@fetchServices');
        cy.get('[data-qa-textfield-error-text="Dashboard"]')
            .should('be.visible')
            .should('have.text', 'Failed to fetch the services.');
    });
    it('displays error message when token API fails', function () {
        (0, cloudpulse_1.mockGetCloudPulseTokenError)(serviceType, 'Internal Server Error').as('getCloudPulseTokenError');
        cy.visitWithLogin('monitor/cloudpulse');
        // Wait for the API calls .
        cy.wait(['@fetchServices', '@fetchDashboard']);
        ui_1.ui.autocomplete
            .findByLabel('Dashboard')
            .should('be.visible')
            .type(dashboardName);
        ui_1.ui.autocompletePopper
            .findByTitle(dashboardName)
            .should('be.visible')
            .click();
        // Select a Database Engine from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Database Engine')
            .should('be.visible')
            .type(engine);
        ui_1.ui.autocompletePopper.findByTitle(engine).should('be.visible').click();
        // Select a region from the dropdown.
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect
            .findItemByRegionId(mockRegion.id, [mockRegion])
            .should('be.visible')
            .click();
        // Select a resource (Database Clusters) from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Database Clusters')
            .should('be.visible')
            .type(clusterName);
        ui_1.ui.autocompletePopper.findByTitle(clusterName).should('be.visible').click();
        ui_1.ui.button
            .findByAttribute('aria-label', 'Close')
            .should('be.visible')
            .click();
        // Select a Node from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Node Type')
            .should('be.visible')
            .type("".concat(nodeType, "{enter}"));
        // Wait for the intercepted error response
        cy.wait('@getCloudPulseTokenError');
        cy.get('[data-qa-error-msg="true"]')
            .should('be.visible')
            .should('have.text', 'Failed to get the authentication token.');
    });
    it('displays error message when Dashboards API fails', function () {
        (0, cloudpulse_1.mockGetCloudPulseServices)([serviceType]).as('fetchServices');
        // Mocking an error response for the 'fetchDashboard' API request for a specific service type.
        (0, cloudpulse_1.mockGetCloudPulseDashboardsError)(serviceType, 'Internal Server Error').as('fetchDashboard');
        cy.visitWithLogin('monitor/cloudpulse');
        // Wait for the API calls .
        cy.wait(['@fetchServices', '@fetchDashboard']);
        // Assert that the error message for fetching the dashboards is displayed correctly.
        cy.get('[data-qa-textfield-error-text="Dashboard"]')
            .should('be.visible')
            .should('have.text', 'Failed to fetch the dashboards.');
    });
    it('displays error message when dashboard details API fails', function () {
        // Mocking an error response for the 'getCloudPulseDashboardById' API request for a specific dashboard ID.
        (0, cloudpulse_1.mockGetCloudPulseDashboardByIdError)(id, 'Internal Server Error').as('getCloudPulseDashboardError');
        cy.visitWithLogin('monitor/cloudpulse');
        // Wait for the API calls .
        cy.wait(['@fetchServices', '@fetchDashboard']);
        //  Select a dashboard from the autocomplete input. Verify that the input is visible before typing.
        ui_1.ui.autocomplete
            .findByLabel('Dashboard')
            .should('be.visible')
            .type(dashboardName);
        ui_1.ui.autocompletePopper
            .findByTitle(dashboardName)
            .should('be.visible')
            .click();
        // Select a Database Engine from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Database Engine')
            .should('be.visible')
            .type(engine);
        ui_1.ui.autocompletePopper.findByTitle(engine).should('be.visible').click();
        //  Select a region from the dropdown.
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect
            .findItemByRegionId(mockRegion.id, [mockRegion])
            .should('be.visible')
            .click();
        // Select a resource (Database Clusters) from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Database Clusters')
            .should('be.visible')
            .type(clusterName);
        ui_1.ui.autocompletePopper.findByTitle(clusterName).should('be.visible').click();
        ui_1.ui.button
            .findByAttribute('aria-label', 'Close')
            .should('be.visible')
            .click();
        //  Select a node type from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Node Type')
            .should('be.visible')
            .type("".concat(nodeType, "{enter}"));
        // Wait for the intercepted error response
        cy.wait('@getCloudPulseDashboardError');
        cy.get('[data-qa-error-msg="true"]')
            .should('be.visible')
            .should('have.text', 'Failed to fetch the dashboard details.');
    });
    it('displays error message when regions API fails', function () {
        // Mocking an error response for the 'CloudPulseRegions' API request.
        (0, regions_1.mockGetRegionsError)('Internal Server Error').as('getCloudPulseRegionsError');
        cy.visitWithLogin('monitor/cloudpulse');
        // Wait for the API calls .
        cy.wait(['@fetchServices', '@fetchDashboard']);
        //  Select a dashboard from the autocomplete input
        ui_1.ui.autocomplete
            .findByLabel('Dashboard')
            .should('be.visible')
            .type(dashboardName);
        ui_1.ui.autocompletePopper
            .findByTitle(dashboardName)
            .should('be.visible')
            .click();
        // Wait for the mocked request to complete
        cy.wait('@getCloudPulseRegionsError');
        cy.get('[data-qa-textfield-error-text="Region"]')
            .should('be.visible')
            .should('have.text', 'Failed to fetch Region.');
    });
    it('displays error message when instance API fails', function () {
        // Mocking an error response for the 'CloudPulseDatabaseInstances' API request.
        (0, databases_1.mockGetDatabasesError)('Internal Server Error').as('getDatabaseInstancesError');
        cy.visitWithLogin('monitor/cloudpulse');
        // Wait for the API calls .
        cy.wait(['@fetchServices', '@fetchDashboard']);
        //  Select a dashboard from the autocomplete input
        ui_1.ui.autocomplete
            .findByLabel('Dashboard')
            .should('be.visible')
            .type(dashboardName);
        ui_1.ui.autocompletePopper
            .findByTitle(dashboardName)
            .should('be.visible')
            .click();
        //  Select a region from the dropdown.
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect
            .findItemByRegionId(mockRegion.id, [mockRegion])
            .should('be.visible')
            .click();
        // Select a Database Engine from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Database Engine')
            .should('be.visible')
            .type(engine);
        ui_1.ui.autocompletePopper.findByTitle(engine).should('be.visible').click();
        // Wait for the intercepted request to complete
        cy.wait('@getDatabaseInstancesError');
        cy.get('[data-qa-textfield-error-text="Database Clusters"]')
            .should('be.visible')
            .should('have.text', 'Failed to fetch Database Clusters.');
    });
});
