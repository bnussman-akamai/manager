"use strict";
/**
 * @file Mocks feature flag clientstream request across all tests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockFeatureFlagClientstream = void 0;
var feature_flags_1 = require("support/intercepts/feature-flags");
/**
 * Mocks LaunchDarkly feature flag clientstream request across all tests.
 *
 * This prevents our feature flag mocks from being overridden.
 */
var mockFeatureFlagClientstream = function () {
    beforeEach(function () {
        (0, feature_flags_1.mockGetFeatureFlagClientstream)();
    });
};
exports.mockFeatureFlagClientstream = mockFeatureFlagClientstream;
