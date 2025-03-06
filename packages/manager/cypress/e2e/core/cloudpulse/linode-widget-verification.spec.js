"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Integration Tests for CloudPulse Linode Dashboard.
 */
var widgets_1 = require("support/constants/widgets");
var account_1 = require("support/intercepts/account");
var cloudpulse_1 = require("support/intercepts/cloudpulse");
var feature_flags_1 = require("support/intercepts/feature-flags");
var linodes_1 = require("support/intercepts/linodes");
var profile_1 = require("support/intercepts/profile");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var cloudpulse_2 = require("support/util/cloudpulse");
var factories_1 = require("src/factories");
var CloudPulseWidgetUtils_1 = require("src/features/CloudPulse/Utils/CloudPulseWidgetUtils");
var unitConversion_1 = require("src/features/CloudPulse/Utils/unitConversion");
/**
 * This test ensures that widget titles are displayed correctly on the dashboard.
 * This test suite is dedicated to verifying the functionality and display of widgets on the Cloudpulse dashboard.
 *  It includes:
 * Validating that widgets are correctly loaded and displayed.
 * Ensuring that widget titles and data match the expected values.
 * Verifying that widget settings, such as granularity and aggregation, are applied correctly.
 * Testing widget interactions, including zooming and filtering, to ensure proper behavior.
 * Each test ensures that widgets on the dashboard operate correctly and display accurate information.
 */
var expectedGranularityArray = ['Auto', '1 day', '1 hr', '5 min'];
var timeDurationToSelect = 'Last 24 Hours';
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
            supportedRegionIds: '',
        },
    ],
};
var _b = widgets_1.widgetDetails.linode, dashboardName = _b.dashboardName, id = _b.id, metrics = _b.metrics, region = _b.region, resource = _b.resource, serviceType = _b.serviceType;
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
var mockLinode = factories_1.linodeFactory.build({
    id: (_a = factories_1.kubeLinodeFactory.build().instance_id) !== null && _a !== void 0 ? _a : undefined,
    label: resource,
});
var mockAccount = factories_1.accountFactory.build();
var mockRegion = factories_1.regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-ord',
    label: 'Chicago, IL',
});
var extendedMockRegion = factories_1.regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-east',
    label: 'Newark,NL',
});
var metricsAPIResponsePayload = factories_1.cloudPulseMetricsResponseFactory.build({
    data: (0, cloudpulse_2.generateRandomMetricsData)(timeDurationToSelect, '5 min'),
});
/**
 * Generates graph data from a given CloudPulse metrics response and
 * extracts average, last, and maximum metric values from the first
 * legend row. The values are rounded to two decimal places for
 * better readability.
 *
 * @param responsePayload - The metrics response object containing
 *                          the necessary data for graph generation.
 * @param label - The label for the graph, used for display purposes.
 *
 * @returns An object containing rounded values for average, last,
 *
 */
var getWidgetLegendRowValuesFromResponse = function (responsePayload, label, unit) {
    // Generate graph data using the provided parameters
    var graphData = (0, CloudPulseWidgetUtils_1.generateGraphData)({
        flags: flags,
        label: label,
        metricsList: responsePayload,
        resources: [
            {
                id: '1',
                label: resource,
                region: 'us-ord',
            },
        ],
        serviceType: serviceType,
        status: 'success',
        unit: unit,
    });
    // Destructure metrics data from the first legend row
    var _a = graphData.legendRowsData[0].data, average = _a.average, last = _a.last, max = _a.max;
    // Round the metrics values to two decimal places
    var roundedAverage = (0, unitConversion_1.formatToolTip)(average, unit);
    var roundedLast = (0, unitConversion_1.formatToolTip)(last, unit);
    var roundedMax = (0, unitConversion_1.formatToolTip)(max, unit);
    // Return the rounded values in an object
    return { average: roundedAverage, last: roundedLast, max: roundedMax };
};
describe('Integration Tests for Linode Dashboard ', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)(flags);
        (0, account_1.mockGetAccount)(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
        (0, linodes_1.mockGetLinodes)([mockLinode]);
        (0, cloudpulse_1.mockGetCloudPulseMetricDefinitions)(serviceType, metricDefinitions);
        (0, cloudpulse_1.mockGetCloudPulseDashboards)(serviceType, [dashboard]).as('fetchDashboard');
        (0, cloudpulse_1.mockGetCloudPulseServices)([serviceType]).as('fetchServices');
        (0, cloudpulse_1.mockGetCloudPulseDashboard)(id, dashboard);
        (0, cloudpulse_1.mockCreateCloudPulseJWEToken)(serviceType);
        (0, cloudpulse_1.mockCreateCloudPulseMetrics)(serviceType, metricsAPIResponsePayload).as('getMetrics');
        (0, regions_1.mockGetRegions)([mockRegion]);
        (0, profile_1.mockGetUserPreferences)({});
        // navigate to the cloudpulse page
        cy.visitWithLogin('monitor');
        // Wait for the services and dashboard API calls to complete before proceeding
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
        // Select a time duration from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Time Range')
            .should('be.visible')
            .type(timeDurationToSelect);
        ui_1.ui.autocompletePopper
            .findByTitle(timeDurationToSelect)
            .should('be.visible')
            .click();
        ui_1.ui.regionSelect.find().click();
        //  Select a region from the dropdown.
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.find().type(extendedMockRegion.label);
        // Since Linode does not support this region, we expect it to not be in the dropdown.
        ui_1.ui.autocompletePopper.find().within(function () {
            cy.findByText("".concat(extendedMockRegion.label, " (").concat(extendedMockRegion.id, ")")).should('not.exist');
        });
        // Select a region from the dropdown.
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.find().clear();
        ui_1.ui.regionSelect.find().type("".concat(region, "{enter}"));
        // Select a resource from the autocomplete input.
        ui_1.ui.autocomplete
            .findByLabel('Resources')
            .should('be.visible')
            .type("".concat(resource, "{enter}"));
        ui_1.ui.autocomplete.findByLabel('Resources').click();
        cy.findByText(resource).should('be.visible');
        // Wait for all metrics query requests to resolve.
        cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
    });
    it('should allow users to select their desired granularity and see the most recent data from the API reflected in the graph', function () {
        // validate the widget level granularity selection and its metrics
        metrics.forEach(function (testData) {
            var widgetSelector = "[data-qa-widget=\"".concat(testData.title, "\"]");
            cy.get(widgetSelector)
                .should('be.visible')
                .find('h2')
                .should('have.text', "".concat(testData.title, " (").concat(testData.unit.trim(), ")"));
            cy.get(widgetSelector)
                .should('be.visible')
                .within(function () {
                // check for all available granularity in popper
                ui_1.ui.autocomplete
                    .findByLabel('Select an Interval')
                    .should('be.visible')
                    .click();
                expectedGranularityArray.forEach(function (option) {
                    ui_1.ui.autocompletePopper.findByTitle(option).should('exist');
                });
                (0, cloudpulse_1.mockCreateCloudPulseMetrics)(serviceType, metricsAPIResponsePayload).as('getGranularityMetrics');
                // find the interval component and select the expected granularity
                ui_1.ui.autocomplete
                    .findByLabel('Select an Interval')
                    .should('be.visible')
                    .type("".concat(testData.expectedGranularity, "{enter}")); // type expected granularity
                // check if the API call is made correctly with time granularity value selected
                cy.wait('@getGranularityMetrics').then(function (interception) {
                    expect(interception)
                        .to.have.property('response')
                        .with.property('statusCode', 200);
                    expect(testData.expectedGranularity).to.include(interception.request.body.time_granularity.value);
                });
                // validate the widget areachart is present
                cy.get('.recharts-responsive-container').within(function () {
                    var expectedWidgetValues = getWidgetLegendRowValuesFromResponse(metricsAPIResponsePayload, testData.title, testData.unit);
                    var graphRowTitle = "[data-qa-graph-row-title=\"".concat(testData.title, " (").concat(testData.unit, ")\"]");
                    cy.get(graphRowTitle)
                        .should('be.visible')
                        .should('have.text', "".concat(testData.title, " (").concat(testData.unit, ")"));
                    cy.log('expectedWidgetValues ', expectedWidgetValues.max);
                    cy.get("[data-qa-graph-column-title=\"Max\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.max));
                    cy.get("[data-qa-graph-column-title=\"Avg\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.average));
                    cy.get("[data-qa-graph-column-title=\"Last\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.last));
                });
            });
        });
    });
    it('should allow users to select the desired aggregation and view the latest data from the API displayed in the graph', function () {
        metrics.forEach(function (testData) {
            var widgetSelector = "[data-qa-widget=\"".concat(testData.title, "\"]");
            cy.get(widgetSelector)
                .should('be.visible')
                .within(function () {
                (0, cloudpulse_1.mockCreateCloudPulseMetrics)(serviceType, metricsAPIResponsePayload).as('getAggregationMetrics');
                // find the interval component and select the expected granularity
                ui_1.ui.autocomplete
                    .findByLabel('Select an Aggregate Function')
                    .should('be.visible')
                    .type("".concat(testData.expectedAggregation, "{enter}")); // type expected granularity
                // check if the API call is made correctly with time granularity value selected
                cy.wait('@getAggregationMetrics').then(function (interception) {
                    expect(interception)
                        .to.have.property('response')
                        .with.property('statusCode', 200);
                    expect(testData.expectedAggregation).to.equal(interception.request.body.aggregate_function);
                });
                // validate the widget areachart is present
                cy.get('.recharts-responsive-container').within(function () {
                    var expectedWidgetValues = getWidgetLegendRowValuesFromResponse(metricsAPIResponsePayload, testData.title, testData.unit);
                    var graphRowTitle = "[data-qa-graph-row-title=\"".concat(testData.title, " (").concat(testData.unit, ")\"]");
                    cy.get(graphRowTitle)
                        .should('be.visible')
                        .should('have.text', "".concat(testData.title, " (").concat(testData.unit.trim(), ")"));
                    cy.get("[data-qa-graph-column-title=\"Max\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.max));
                    cy.get("[data-qa-graph-column-title=\"Avg\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.average));
                    cy.get("[data-qa-graph-column-title=\"Last\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.last));
                });
            });
        });
    });
    it('should trigger the global refresh button and verify the corresponding network calls', function () {
        (0, cloudpulse_1.mockCreateCloudPulseMetrics)(serviceType, metricsAPIResponsePayload).as('refreshMetrics');
        // click the global refresh button
        ui_1.ui.button
            .findByAttribute('aria-label', 'Refresh Dashboard Metrics')
            .should('be.visible')
            .click();
        // validate the API calls are going with intended payload
        cy.get('@refreshMetrics.all')
            .should('have.length', 4)
            .each(function (xhr) {
            var interception = xhr;
            var requestPayload = interception.request.body;
            var metric = requestPayload.metric, timeRange = requestPayload.relative_time_duration;
            var metricData = metrics.find(function (_a) {
                var name = _a.name;
                return name === metric;
            });
            if (!metricData) {
                throw new Error("Unexpected metric name '".concat(metric, "' included in the outgoing refresh API request"));
            }
            expect(metric).to.equal(metricData.name);
            expect(timeRange).to.have.property('unit', 'hr');
            expect(timeRange).to.have.property('value', 24);
        });
    });
    it('should zoom in and out of all the widgets', function () {
        // do zoom in and zoom out test on all the widgets
        metrics.forEach(function (testData) {
            cy.get("[data-qa-widget=\"".concat(testData.title, "\"]")).as('widget');
            cy.get('@widget')
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByAttribute('aria-label', 'Zoom Out')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.get('@widget').should('be.visible');
                cy.get('.recharts-responsive-container').within(function () {
                    var expectedWidgetValues = getWidgetLegendRowValuesFromResponse(metricsAPIResponsePayload, testData.title, testData.unit);
                    var graphRowTitle = "[data-qa-graph-row-title=\"".concat(testData.title, " (").concat(testData.unit, ")\"]");
                    cy.get(graphRowTitle)
                        .should('be.visible')
                        .should('have.text', "".concat(testData.title, " (").concat(testData.unit, ")"));
                    cy.get("[data-qa-graph-column-title=\"Max\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.max));
                    cy.get("[data-qa-graph-column-title=\"Avg\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.average));
                    cy.get("[data-qa-graph-column-title=\"Last\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.last));
                });
                // click zoom out and validate the same
                ui_1.ui.button
                    .findByAttribute('aria-label', 'Zoom In')
                    .should('be.visible')
                    .should('be.enabled')
                    .scrollIntoView()
                    .click({ force: true });
                cy.get('@widget').should('be.visible');
                cy.get('.recharts-responsive-container').within(function () {
                    var expectedWidgetValues = getWidgetLegendRowValuesFromResponse(metricsAPIResponsePayload, testData.title, testData.unit);
                    var graphRowTitle = "[data-qa-graph-row-title=\"".concat(testData.title, " (").concat(testData.unit, ")\"]");
                    cy.get(graphRowTitle)
                        .should('be.visible')
                        .should('have.text', "".concat(testData.title, " (").concat(testData.unit.trim(), ")"));
                    cy.get("[data-qa-graph-column-title=\"Max\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.max));
                    cy.get("[data-qa-graph-column-title=\"Avg\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.average));
                    cy.get("[data-qa-graph-column-title=\"Last\"]")
                        .should('be.visible')
                        .should('have.text', "".concat(expectedWidgetValues.last));
                });
            });
        });
    });
});
