"use strict";
/**
 * @file Utilities related to Cypress HTTP request intercepts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiMatcher = void 0;
/**
 * Returns a glob pattern to match against the given API endpoint.
 *
 * @param endpointPattern - API v4 endpoint pattern for URL matcher.
 *
 * @returns Intercept glob pattern for the given API endpoint.
 */
var apiMatcher = function (endpointPattern) {
    return "**/+(v4|v4beta)/".concat(endpointPattern);
};
exports.apiMatcher = apiMatcher;
