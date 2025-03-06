"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusMap = exports.aggregationTypeMap = exports.severityMap = exports.metricOperatorTypeMap = exports.dimensionOperatorTypeMap = void 0;
exports.dimensionOperatorTypeMap = {
    endswith: 'ends with',
    eq: 'equals',
    neq: 'not equals',
    startswith: 'starts with',
};
exports.metricOperatorTypeMap = {
    eq: '=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
};
exports.severityMap = {
    0: 'Severe',
    1: 'Medium',
    2: 'Low',
    3: 'Info',
};
exports.aggregationTypeMap = {
    avg: 'Average',
    count: 'Count',
    max: 'Maximum',
    min: 'Minimum',
    sum: 'Sum',
};
exports.statusMap = {
    disabled: 'Disabled',
    enabled: 'Enabled',
};
