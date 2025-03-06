"use strict";
/**
 * @file Cypress intercepts and mocks for Cloud Manager feature flags.
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
exports.mockAppendFeatureFlags = exports.mockGetFeatureFlagClientstream = void 0;
var feature_flags_1 = require("support/util/feature-flags");
var feature_flags_2 = require("support/constants/feature-flags");
/**
 * Intercepts GET request to feature flag clientstream URL and mocks the response.
 *
 * This blocks Cloud Manager from initiating a stream with our feature flag
 * service, preventing our mocks from being overridden.
 */
var mockGetFeatureFlagClientstream = function () {
    return cy.intercept('GET', feature_flags_2.launchDarklyClientstreamPattern, {});
};
exports.mockGetFeatureFlagClientstream = mockGetFeatureFlagClientstream;
/**
 * Intercepts GET request to fetch feature flags and modifies the response.
 *
 * The given feature flag mock data is merged with the actual response data so
 * that existing but unrelated feature flags are unmodified.
 *
 * The response from LaunchDarkly is not modified if the status code is
 * anything other than 200.
 *
 * @param featureFlags - Feature flag mock data with which to append response.
 *
 * @returns Cypress chainable.
 */
var mockAppendFeatureFlags = function (featureFlags) {
    var mockFeatureFlagResponse = (0, feature_flags_1.getResponseDataFromMockData)(featureFlags);
    return cy.intercept('GET', feature_flags_2.launchDarklyUrlPattern, function (req) {
        req.continue(function (res) {
            if (res.statusCode === 200) {
                res.body = __assign(__assign({}, res.body), mockFeatureFlagResponse);
            }
        });
    });
};
exports.mockAppendFeatureFlags = mockAppendFeatureFlags;
