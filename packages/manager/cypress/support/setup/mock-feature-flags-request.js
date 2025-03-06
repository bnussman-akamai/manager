"use strict";
/**
 * @file Intercepts and mocks Launch Darkly feature flag requests with override data if specified.
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
exports.mockFeatureFlagRequests = void 0;
var feature_flags_1 = require("support/constants/feature-flags");
/**
 * If feature flag overrides have been specified, intercept every LaunchDarkly
 * feature flag request and modify the response to contain the override data.
 *
 * This override happens before other intercepts and mocks (e.g. via `mockGetFeatureFlags`
 * and `mockAppendFeatureFlags`), so mocks set up by those functions will take
 * priority in the event that both modify the same feature flag value.
 */
var mockFeatureFlagRequests = function () {
    var featureFlagOverrides = Cypress.env('featureFlagOverrides');
    if (featureFlagOverrides) {
        beforeEach(function () {
            cy.intercept({
                middleware: true,
                url: feature_flags_1.launchDarklyUrlPattern,
            }, function (req) {
                req.on('before:response', function (res) {
                    var overriddenFeatureFlagData = __assign(__assign({}, res.body), featureFlagOverrides);
                    res.body = overriddenFeatureFlagData;
                });
            });
        });
    }
};
exports.mockFeatureFlagRequests = mockFeatureFlagRequests;
