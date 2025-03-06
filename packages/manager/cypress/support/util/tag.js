"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateQuery = exports.evaluateQueryRule = exports.getHumanReadableQueryRules = exports.getQueryRules = exports.validateQuery = exports.addTag = exports.tag = exports.testTagMap = void 0;
var arrays_1 = require("./arrays");
var queryRegex = /(?:-|\+)?([^\s]+)/g;
/**
 *
 */
exports.testTagMap = new Map();
/**
 * Sets tags for the current runnable.
 *
 * @param tags - Test tags.
 */
var tag = function () {
    var tags = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        tags[_i] = arguments[_i];
    }
    var extendedMochaContext = cy.state('ctx');
    if (extendedMochaContext) {
        extendedMochaContext.tags = (0, arrays_1.removeDuplicates)(tags);
    }
};
exports.tag = tag;
/**
 * Adds tags for the given runnable.
 *
 * If tags have already been set (e.g. using a hook), this method will add
 * the given tags in addition the tags that have already been set.
 *
 * @param tags - Test tags.
 */
var addTag = function () {
    var tags = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        tags[_i] = arguments[_i];
    }
    var extendedMochaContext = cy.state('ctx');
    if (extendedMochaContext) {
        extendedMochaContext.tags = (0, arrays_1.removeDuplicates)(__spreadArray(__spreadArray([], (extendedMochaContext.tags || []), true), tags, true));
    }
};
exports.addTag = addTag;
/**
 * Returns a boolean indicating whether `query` is a valid test tag query.
 *
 * @param query - Test tag query string.
 *
 * @return `true` if `query` is valid, `false` otherwise.
 */
var validateQuery = function (query) {
    // An empty string is a special case.
    if (query === '') {
        return true;
    }
    var result = queryRegex.test(query);
    queryRegex.lastIndex = 0;
    return result;
};
exports.validateQuery = validateQuery;
/**
 * Gets an array of individual query rules from a query string.
 *
 * @param query - Query string from which to get query rules.
 *
 * @example
 * // Query for all Linode or Volume tests, which also test Placement Groups,
 * // and which are not end-to-end.
 * const query = '+feat:linode,feat:volumes feat:placementGroups -e2e'
 * getQueryRules(query);
 * // Expected output: ['+feat:linode,feat:volumes', '+feat:placementGroups', '-e2e']
 *
 * @returns Array of query rule strings.
 */
var getQueryRules = function (query) {
    var _a;
    return ((_a = query.match(queryRegex)) !== null && _a !== void 0 ? _a : []).map(function (rule) {
        if (!['-', '+'].includes(rule[0]) || rule.length === 1) {
            return "+".concat(rule);
        }
        return rule;
    });
};
exports.getQueryRules = getQueryRules;
/**
 * Returns an array of human-readable query rules.
 *
 * This can be useful for presentation or debugging purposes.
 */
var getHumanReadableQueryRules = function (query) {
    return (0, exports.getQueryRules)(query).map(function (queryRule) {
        var queryOperation = queryRule[0];
        var queryOperands = queryRule.slice(1).split(',');
        var operationName = queryOperation === '+' ? "HAS TAG" : "DOES NOT HAVE TAG";
        var tagNames = queryOperands.join(' OR ');
        return "".concat(operationName, " ").concat(tagNames);
    });
};
exports.getHumanReadableQueryRules = getHumanReadableQueryRules;
/**
 * Evaluates a query rule against an array of test tags.
 *
 * @param queryRule - Query rule against which to evaluate test tags.
 * @param tags - Tags to evaluate.
 *
 * @returns `true` if tags satisfy the query rule, `false` otherwise.
 */
var evaluateQueryRule = function (queryRule, tags) {
    var queryOperation = queryRule[0]; // Either '-' or '+'.
    var queryOperands = queryRule.slice(1).split(','); // The tags to check.
    return queryOperation === '+'
        ? tags.some(function (tag) { return queryOperands.includes(tag); })
        : !tags.some(function (tag) { return queryOperands.includes(tag); });
};
exports.evaluateQueryRule = evaluateQueryRule;
/**
 * Evaluates a query against an array of test tags.
 *
 * Tags are considered to satisfy query if every query rule evaluates to `true`.
 *
 * @param query - Query against which to evaluate test tags.
 * @param tags - Tags to evaluate.
 *
 * @returns `true` if tags satisfy query, `false` otherwise.
 */
var evaluateQuery = function (query, tags) {
    if (!(0, exports.validateQuery)(query)) {
        throw new Error("Invalid test tag query '".concat(query, "'"));
    }
    return (0, exports.getQueryRules)(query).every(function (queryRule) {
        return (0, exports.evaluateQueryRule)(queryRule, tags);
    });
};
exports.evaluateQuery = evaluateQuery;
