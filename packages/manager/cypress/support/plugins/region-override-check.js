"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regionOverrideCheck = void 0;
/**
 * If applicable, checks whether the specified override test region is valid.
 *
 * If the specified region does not exist in the list of regions returned by the
 * Linode API, an error is thrown. Otherwise, a message is logged to the console
 * confirming that an override region is being used.
 */
var regionOverrideCheck = function (_on, config) {
    var _a;
    var overrideRegionId = (_a = config.env) === null || _a === void 0 ? void 0 : _a['CY_TEST_REGION'];
    var regions = (config.env['cloudManagerRegions'] || []);
    if (overrideRegionId) {
        var foundRegion = regions.find(function (region) { return region.id == overrideRegionId; });
        if (!foundRegion) {
            throw new Error("Unable to find a region by ID '".concat(overrideRegionId, "'. Does the test account have access to this region?"));
        }
        console.info("Running tests with region forced to '".concat(foundRegion.id, "' (").concat(foundRegion.label, ")."));
    }
};
exports.regionOverrideCheck = regionOverrideCheck;
