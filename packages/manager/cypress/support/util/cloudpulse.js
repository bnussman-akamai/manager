"use strict";
// Function to generate random values based on the number of points
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomMetricsData = void 0;
var generateRandomMetricsData = function (time, granularityData) {
    var _a, _b;
    var currentTime = Math.floor(Date.now() / 1000);
    var intervals = (_a = {},
        _a['1 day'] = 86400,
        _a['1 hr'] = 3600,
        _a['5 min'] = 5 * 60,
        _a['Auto'] = 3600,
        _a);
    var timeRanges = (_b = {},
        _b['Last 7 Days'] = 7 * 24 * 3600,
        _b['Last 12 Hours'] = 12 * 3600,
        _b['Last 24 Hours'] = 24 * 3600,
        _b['Last 30 Days'] = 30 * 24 * 3600,
        _b['Last 30 Minutes'] = 30 * 60,
        _b);
    var interval = intervals[granularityData];
    var timeRangeInSeconds = timeRanges[time];
    var startTime = currentTime - timeRangeInSeconds;
    if (!timeRangeInSeconds) {
        throw new Error("Unsupported time range: ".concat(time));
    }
    if (!interval) {
        throw new Error("Unsupported interval: ".concat(interval));
    }
    var values = Array.from({ length: Math.ceil(timeRangeInSeconds / interval) + 1 }, function (_, i) {
        var timestamp = startTime + i * interval;
        var value = (Math.round(Math.random() * 100 * 100) / 100).toFixed(2); // Round and convert to string with 2 decimal places
        return [timestamp, value];
    });
    return {
        result: [{ metric: {}, values: values }],
        result_type: 'matrix',
    };
};
exports.generateRandomMetricsData = generateRandomMetricsData;
