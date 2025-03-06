"use strict";
/**
 * @file Types and utilities related to Cloud Manager feature flags.
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
exports.makeFeatureFlagData = exports.getResponseDataFromMockData = exports.isPartialFeatureFlagData = void 0;
var defaultFeatureFlagData = {
    flagVersion: 1,
    trackEvents: false,
    variation: 0,
    version: 1,
};
/**
 * Determines whether the given data is a partial representation of `FeatureFlagData`.
 *
 * @returns `true` if `data` is a partial feature flag object, `false` otherwise.
 */
var isPartialFeatureFlagData = function (data) {
    if (typeof data === 'object' && data !== null && 'value' in data) {
        return true;
    }
    return false;
};
exports.isPartialFeatureFlagData = isPartialFeatureFlagData;
/**
 * Returns a new `FeatureFlagResponseData` object for the given
 * `FeatureFlagMockData` object.
 *
 * @param data - Feature flag mock data from which to create response data.
 *
 * @returns Feature flag response data that can be used for mocking purposes.
 */
var getResponseDataFromMockData = function (data) {
    return Object.keys(data).reduce(function (output, cur) {
        var mockData = output[cur];
        if ((0, exports.isPartialFeatureFlagData)(mockData)) {
            output[cur] = __assign(__assign({}, defaultFeatureFlagData), mockData);
            return output;
        }
        else {
            output[cur] = (0, exports.makeFeatureFlagData)(mockData);
        }
        return output;
    }, data);
};
exports.getResponseDataFromMockData = getResponseDataFromMockData;
/**
 * Returns an object containing feature flag data.
 *
 * @param value - Feature flag value.
 * @param variation - Feature flag variation. Optional.
 * @param version - Version shared by flag data. Optional.
 * @param trackEvents - Whether events are tracked. Optional.
 * @param flagVersion - Flag version. Optional.
 */
var makeFeatureFlagData = function (value, variation, version, trackEvents, flagVersion) {
    return {
        flagVersion: flagVersion !== null && flagVersion !== void 0 ? flagVersion : defaultFeatureFlagData.flagVersion,
        trackEvents: trackEvents !== null && trackEvents !== void 0 ? trackEvents : defaultFeatureFlagData.trackEvents,
        value: value,
        variation: variation !== null && variation !== void 0 ? variation : defaultFeatureFlagData.variation,
        version: version !== null && version !== void 0 ? version : defaultFeatureFlagData.version,
    };
};
exports.makeFeatureFlagData = makeFeatureFlagData;
