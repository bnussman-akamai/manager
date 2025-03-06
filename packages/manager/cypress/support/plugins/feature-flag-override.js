"use strict";
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
exports.featureFlagOverrides = void 0;
/**
 * Handles setup related to Launch Darkly feature flag overrides.
 *
 * Checks if the user has passed overrides via the `CY_TEST_FEATURE_FLAGS` env,
 * and validates its value if so by attempting to parse it as JSON. If that
 * succeeds, the parsed override object is exposed to Cypress via the
 * `featureFlagOverrides` config.
 */
var featureFlagOverrides = function (_on, config) {
    var _a;
    var featureFlagOverridesJson = (_a = config.env) === null || _a === void 0 ? void 0 : _a['CY_TEST_FEATURE_FLAGS'];
    var featureFlagOverrides = undefined;
    if (featureFlagOverridesJson) {
        var notice = 'Feature flag overrides are enabled with the following JSON payload:';
        var jsonWarning = 'Be aware that malformed or invalid feature flag data can trigger crashes and other unexpected behavior.';
        console.info("".concat(notice, "\n\n").concat(featureFlagOverridesJson, "\n\n").concat(jsonWarning));
        try {
            featureFlagOverrides = JSON.parse(featureFlagOverridesJson);
        }
        catch (e) {
            throw new Error("Unable to parse feature flag JSON:\n\n".concat(featureFlagOverridesJson, "\n\nPlease double check your 'CY_TEST_FEATURE_FLAGS' value and try again."));
        }
    }
    return __assign(__assign({}, config), { env: __assign(__assign({}, config.env), { featureFlagOverrides: featureFlagOverrides }) });
};
exports.featureFlagOverrides = featureFlagOverrides;
