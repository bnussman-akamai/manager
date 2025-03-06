"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Integration Tests for CloudPulse Custom and Preset Verification
 */
var luxon_1 = require("luxon");
var widgets_1 = require("support/constants/widgets");
var account_1 = require("support/intercepts/account");
var cloudpulse_1 = require("support/intercepts/cloudpulse");
var databases_1 = require("support/intercepts/databases");
var feature_flags_1 = require("support/intercepts/feature-flags");
var profile_1 = require("support/intercepts/profile");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var cloudpulse_2 = require("support/util/cloudpulse");
var factories_1 = require("src/factories");
var CloudPulseDateTimePickerUtils_1 = require("src/features/CloudPulse/Utils/CloudPulseDateTimePickerUtils");
var formatDate_1 = require("src/utilities/formatDate");
var formatter = "yyyy-MM-dd'T'HH:mm:ss'Z'";
var cleanText = function (string) {
    return string.replace(/\u200e|\u2066|\u2067|\u2068|\u2069/g, '');
};
var timeRanges = [
    { label: 'Last 30 Minutes', unit: 'min', value: 30 },
    { label: 'Last 12 Hours', unit: 'hr', value: 12 },
    { label: 'Last 24 Hours', unit: 'hr', value: 24 },
    { label: 'Last 30 Days', unit: 'days', value: 30 },
    { label: 'Last 7 Days', unit: 'days', value: 7 },
    { label: 'Last 1 Hour', unit: 'hr', value: 1 },
];
var mockRegion = factories_1.regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-ord',
    label: 'Chicago, IL',
});
var flags = {
    aclp: { beta: true, enabled: true },
    aclpResourceTypeMap: [
        {
            dimensionKey: 'cluster_id',
            maxResourceSelections: 10,
            serviceType: 'dbaas',
            supportedRegionIds: 'us-ord',
        },
    ],
};
var _a = widgets_1.widgetDetails.dbaas, dashboardName = _a.dashboardName, engine = _a.engine, id = _a.id, metrics = _a.metrics, serviceType = _a.serviceType;
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
var metricDefinitions = {
    data: metrics.map(function (_a) {
        var name = _a.name, title = _a.title, unit = _a.unit;
        return factories_1.dashboardMetricFactory.build({
            label: title,
            metric: name,
            unit: unit,
        });
    }),
};
var mockAccount = factories_1.accountFactory.build();
var metricsAPIResponsePayload = factories_1.cloudPulseMetricsResponseFactory.build({
    data: (0, cloudpulse_2.generateRandomMetricsData)('Last 30 Days', '1 day'),
});
var databaseMock = factories_1.databaseFactory.build({
    region: mockRegion.label,
    type: engine,
});
var mockProfile = factories_1.profileFactory.build({
    timezone: 'Etc/GMT',
});
/**
 * Generates a date in Indian Standard Time (IST) based on a specified number of days offset,
 * hour, and minute. The function also provides individual date components such as day, hour,
 * minute, month, and AM/PM.
 *
 * @param {number} daysOffset - The number of days to adjust from the current date. Positive
 *                               values give a future date, negative values give a past date.
 * @param {number} hour - The hour to set for the resulting date (0-23).
 * @param {number} [minute=0] - The minute to set for the resulting date (0-59). Defaults to 0.
 *
 * @returns {Object} - Returns an object containing:
 *   - `actualDate`: The formatted date and time in IST (YYYY-MM-DD HH:mm).
 *   - `day`: The day of the month as a number.
 *   - `hour`: The hour in the 24-hour format as a number.
 *   - `minute`: The minute of the hour as a number.
 *   - `month`: The month of the year as a number.
 */
var getDateRangeInGMT = function (hour, minute, isStart) {
    if (minute === void 0) { minute = 0; }
    if (isStart === void 0) { isStart = false; }
    var now = luxon_1.DateTime.now().setZone('GMT'); // Set the timezone to GMT
    var targetDate = isStart
        ? now.startOf('month').set({ hour: hour, minute: minute })
        : now.set({ hour: hour, minute: minute });
    var actualDate = targetDate.toFormat('yyyy-LL-dd HH:mm'); // Format in GMT
    return {
        actualDate: actualDate,
        day: targetDate.day,
        hour: targetDate.hour,
        minute: targetDate.minute,
        month: targetDate.month,
    };
};
/**
 * This function calculates the start of the current month and the current date and time,
 * adjusted by subtracting 5 hours and 30 minutes, and returns them in the ISO 8601 format (UTC).
 *
 * @returns {{start: string, end: string}} - The start and end dates of the current month in ISO 8601 format.
 */
var getThisMonthRange = function () {
    var _a, _b;
    var now = luxon_1.DateTime.now();
    var expectedStartDateISO = (_a = now.startOf('month').toISO()) !== null && _a !== void 0 ? _a : '';
    var expectedEndDateISO = (_b = now.toISO()) !== null && _b !== void 0 ? _b : '';
    var adjustedStartDate = luxon_1.DateTime.fromISO(expectedStartDateISO, {
        zone: 'gmt',
    });
    var adjustedEndDate = luxon_1.DateTime.fromISO(expectedEndDateISO, { zone: 'gmt' });
    var formattedStartDate = adjustedStartDate.toFormat(formatter);
    var formattedEndDate = adjustedEndDate.toFormat(formatter);
    return {
        end: formattedEndDate,
        start: formattedStartDate,
    };
};
var getLastMonthRange = function () {
    var _a, _b;
    var now = luxon_1.DateTime.now();
    // Get the last month by subtracting 1 month from the current date
    var lastMonth = now.minus({ months: 1 });
    // Get the start and end of the last month in ISO format
    var expectedStartDateISO = (_a = lastMonth.startOf('month').toISO()) !== null && _a !== void 0 ? _a : '';
    var expectedEndDateISO = (_b = lastMonth.endOf('month').toISO()) !== null && _b !== void 0 ? _b : '';
    // Adjust the start and end dates to GMT
    var adjustedStartDate = luxon_1.DateTime.fromISO(expectedStartDateISO, {
        zone: 'gmt',
    });
    var adjustedEndDate = luxon_1.DateTime.fromISO(expectedEndDateISO, { zone: 'gmt' });
    // Format the dates according to the specified format
    var formattedStartDate = adjustedStartDate.toFormat(formatter);
    var formattedEndDate = adjustedEndDate.toFormat(formatter);
    return {
        end: formattedEndDate,
        start: formattedStartDate,
    };
};
describe('Integration tests for verifying Cloudpulse custom and preset configurations', function () {
    /*
     * - Mocks user preferences for dashboard details (dashboard, engine, resources, and region).
     * - Simulates loading test data without real API calls.
     *
     * - Creates a mock profile with timezone set to GMT ('Etc/GMT').
     * - Ensures consistency in time-based functionality and API requests.
     *
     * - Confirms accurate calculation of "This Month" and "Last Month" time ranges.
     * - Verifies start and end dates are correctly computed and returned in ISO 8601 GMT format.
     *
     * - Confirms functionality of preset and relative time ranges, ensuring correct time range picker behavior.
     * - Verifies correct custom date and time range selection.
     *
     * - Ensures start and end date pickers are visible, interacts with them, and asserts correct date values in "PM" format.
     *
     * - Waits for 4 `@getMetrics` API calls, verifies correct payload with `start` and `end` times.
     * - Ensures times are correctly converted to GMT and match `startActualDate` and `endActualDate`.
     */
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)(flags);
        (0, account_1.mockGetAccount)(mockAccount);
        (0, cloudpulse_1.mockGetCloudPulseMetricDefinitions)(serviceType, metricDefinitions.data);
        (0, cloudpulse_1.mockGetCloudPulseDashboards)(serviceType, [dashboard]).as('fetchDashboard');
        (0, cloudpulse_1.mockGetCloudPulseServices)([serviceType]).as('fetchServices');
        (0, cloudpulse_1.mockGetCloudPulseDashboard)(id, dashboard);
        (0, cloudpulse_1.mockCreateCloudPulseJWEToken)(serviceType);
        (0, cloudpulse_1.mockCreateCloudPulseMetrics)(serviceType, metricsAPIResponsePayload).as('getMetrics');
        (0, regions_1.mockGetRegions)([mockRegion]);
        (0, profile_1.mockGetProfile)(mockProfile);
        (0, profile_1.mockGetUserPreferences)({
            aclpPreference: {
                dashboardId: id,
                engine: engine.toLowerCase(),
                region: mockRegion.id,
                resources: ['1'],
            },
        }).as('fetchPreferences');
        (0, databases_1.mockGetDatabases)([databaseMock]);
        cy.visitWithLogin('monitor');
        cy.wait(['@fetchServices', '@fetchDashboard', '@fetchPreferences']);
    });
    it('Implement and validate the functionality of the custom date and time picker for selecting a specific date and time range', function () {
        // Calculates start and end dates in GMT using `getDateRangeInGMT` for testing date and time ranges.
        var _a = getDateRangeInGMT(12, 15, true), startActualDate = _a.actualDate, startDay = _a.day, startHour = _a.hour, startMinute = _a.minute;
        var _b = getDateRangeInGMT(12, 30), endActualDate = _b.actualDate, endDay = _b.day, endHour = _b.hour, endMinute = _b.minute;
        // Select "Custom" from the "Time Range" dropdown
        ui_1.ui.autocomplete
            .findByLabel('Time Range')
            .scrollIntoView()
            .should('be.visible')
            .type('Custom');
        // Select "Custom" from the autocomplete dropdown
        ui_1.ui.autocompletePopper.findByTitle('Custom').should('be.visible').click();
        // Click on "Select Start Date" input field
        cy.findByPlaceholderText('Select Start Date').should('be.visible').click();
        // Select the start date from the calendar
        cy.findByRole('gridcell', { name: startDay.toString() })
            .should('be.visible')
            .click();
        // Clicks the button closest to the Clock Icon, bypassing any visible state with `force: true`.
        cy.findByLabelText('Choose time, selected time is', { exact: false })
            .closest('button')
            .click();
        // Selects the start hour, minute, and meridiem (AM/PM) in the time picker.
        cy.findByLabelText('Select hours')
            .as('selectHours')
            .scrollIntoView({ easing: 'linear' });
        cy.get('@selectHours').within(function () {
            cy.get("[aria-label=\"".concat(startHour, " hours\"]")).click();
        });
        cy.findByLabelText('Select minutes')
            .as('selectMinutes')
            .scrollIntoView({ duration: 500, easing: 'linear' });
        cy.get('@selectMinutes').within(function () {
            cy.get("[aria-label=\"".concat(startMinute, " minutes\"]")).click();
        });
        cy.findByLabelText('Select meridiem')
            .as('selectMeridiem')
            .scrollIntoView({ duration: 500, easing: 'linear' });
        cy.get('@selectMeridiem').within(function () {
            cy.get("[aria-label=\"PM\"]").click();
        });
        // Click the "Apply" button to confirm the start date and time
        ui_1.ui.button
            .findByAttribute('label', 'Apply')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Assert that the start date and time is correctly displayed
        cy.findByPlaceholderText('Select Start Date')
            .as('selectStartDate')
            .scrollIntoView({ easing: 'linear' });
        cy.get('@selectStartDate')
            .should('be.visible')
            .should('have.value', "".concat(cleanText(startActualDate), " PM"));
        // Click on "Select End Date" input field
        cy.findByPlaceholderText('Select End Date').should('be.visible').click();
        // Select the end date from the calendar
        cy.findByRole('gridcell', { name: endDay.toString() })
            .should('be.visible')
            .click();
        cy.findByLabelText('Choose time, selected time is', { exact: false })
            .closest('button')
            .click();
        // Selects the start hour, minute, and meridiem (AM/PM) in the time picker.
        cy.findByLabelText('Select hours').scrollIntoView({
            duration: 500,
            easing: 'linear',
        });
        cy.get('@selectHours').within(function () {
            cy.get("[aria-label=\"".concat(endHour, " hours\"]")).click();
        });
        cy.findByLabelText('Select minutes').scrollIntoView({
            duration: 500,
            easing: 'linear',
        });
        cy.get('@selectMinutes').within(function () {
            cy.get("[aria-label=\"".concat(endMinute, " minutes\"]")).click();
        });
        cy.findByLabelText('Select meridiem').scrollIntoView({
            duration: 500,
            easing: 'linear',
        });
        cy.get('@selectMeridiem').within(function () {
            cy.get("[aria-label=\"PM\"]").click();
        });
        // Click the "Apply" button to confirm the end date and time
        ui_1.ui.button
            .findByAttribute('label', 'Apply')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Assert that the end date and time is correctly displayed
        cy.findByPlaceholderText('Select End Date').scrollIntoView({
            easing: 'linear',
        });
        cy.findByPlaceholderText('Select End Date')
            .should('be.visible')
            .should('have.value', "".concat(cleanText(endActualDate), " PM"));
        // Select the "Node Type" from the dropdown and submit
        ui_1.ui.autocomplete
            .findByLabel('Node Type')
            .should('be.visible')
            .type('Primary{enter}');
        // Wait for all API calls to complete before assertions
        cy.wait(Array(4).fill('@getMetrics'));
        cy.get('@getMetrics.all')
            .should('have.length', 4)
            .each(function (xhr) {
            var interception = xhr;
            var requestPayload = interception.request.body;
            expect(requestPayload.absolute_time_duration.start).to.equal((0, CloudPulseDateTimePickerUtils_1.convertToGmt)(startActualDate.replace(' ', 'T')));
            expect(requestPayload.absolute_time_duration.end).to.equal((0, CloudPulseDateTimePickerUtils_1.convertToGmt)(endActualDate.replace(' ', 'T')));
        });
        // Click on the "Presets" button
        ui_1.ui.buttonGroup.findButtonByTitle('Presets').should('be.visible').click();
        // Mock API response for cloud metrics presets
        (0, cloudpulse_1.mockCreateCloudPulseMetrics)(serviceType, metricsAPIResponsePayload).as('getPresets');
        // Select "Last 30 Days" from the "Time Range" dropdown
        ui_1.ui.autocomplete
            .findByLabel('Time Range')
            .should('be.visible')
            .type('Last 30 Days');
        // Click on the "Last 30 Days" option
        ui_1.ui.autocompletePopper
            .findByTitle('Last 30 Days')
            .should('be.visible')
            .click();
        // Validate API request payload for relative time duration
        cy.get('@getPresets.all')
            .should('have.length', 4)
            .each(function (xhr, index) {
            var interception = xhr;
            var requestPayload = interception.request.body;
            expect(requestPayload).to.have.nested.property('relative_time_duration.unit');
            expect(requestPayload).to.have.nested.property('relative_time_duration.value');
            expect(requestPayload.relative_time_duration.unit).to.equal('days');
            expect(requestPayload.relative_time_duration.value).to.equal(30);
        });
    });
    timeRanges.forEach(function (range) {
        it("Select and validate the functionality of the \"".concat(range.label, "\" preset from the \"Time Range\" dropdown"), function () {
            ui_1.ui.autocomplete
                .findByLabel('Time Range')
                .scrollIntoView()
                .should('be.visible')
                .type(range.label);
            ui_1.ui.autocompletePopper
                .findByTitle(range.label)
                .should('be.visible')
                .click();
            ui_1.ui.autocomplete
                .findByLabel('Node Type')
                .should('be.visible')
                .type('Primary{enter}');
            cy.wait(Array(4).fill('@getMetrics'));
            cy.get('@getMetrics.all')
                .should('have.length', 4)
                .each(function (xhr) {
                var interception = xhr;
                var requestPayload = interception.request.body;
                expect(requestPayload.relative_time_duration.unit).to.equal(range.unit);
                expect(requestPayload.relative_time_duration.value).to.equal(range.value);
            });
        });
    });
    it('Select the "Last Month" preset from the "Time Range" dropdown and verify its functionality.', function () {
        var _a = getLastMonthRange(), end = _a.end, start = _a.start;
        ui_1.ui.autocomplete
            .findByLabel('Time Range')
            .scrollIntoView()
            .should('be.visible')
            .type('Last Month');
        ui_1.ui.autocompletePopper
            .findByTitle('Last Month')
            .should('be.visible')
            .click();
        ui_1.ui.autocomplete
            .findByLabel('Node Type')
            .should('be.visible')
            .type('Primary{enter}');
        cy.wait(Array(4).fill('@getMetrics'));
        cy.get('@getMetrics.all')
            .should('have.length', 4)
            .each(function (xhr) {
            var interception = xhr;
            var requestPayload = interception.request.body;
            expect(requestPayload.absolute_time_duration.start).to.equal(start);
            expect(requestPayload.absolute_time_duration.end).to.equal(end);
        });
    });
    it('Select the "This Month" preset from the "Time Range" dropdown and verify its functionality.', function () {
        var _a = getThisMonthRange(), end = _a.end, start = _a.start;
        ui_1.ui.autocomplete
            .findByLabel('Time Range')
            .scrollIntoView()
            .should('be.visible')
            .type('This Month');
        ui_1.ui.autocompletePopper
            .findByTitle('This Month')
            .should('be.visible')
            .click();
        ui_1.ui.autocomplete
            .findByLabel('Node Type')
            .should('be.visible')
            .type('Primary{enter}');
        cy.wait(Array(4).fill('@getMetrics'));
        cy.get('@getMetrics.all')
            .should('have.length', 4)
            .each(function (xhr) {
            var interception = xhr;
            var requestPayload = interception.request.body;
            expect(requestPayload.absolute_time_duration.start).to.equal(start);
            expect((0, formatDate_1.formatDate)(requestPayload.absolute_time_duration.end, {
                format: 'yyyy-MM-dd hh:mm',
            })).to.equal((0, formatDate_1.formatDate)(end, { format: 'yyyy-MM-dd hh:mm' }));
        });
    });
});
