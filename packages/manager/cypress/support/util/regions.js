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
exports.describeRegions = exports.testRegions = exports.chooseRegions = exports.chooseRegion = exports.getRegionByLabel = exports.getRegionById = exports.getTestableRegions = exports.regions = exports.getOverrideRegion = exports.getRegionFromExtendedRegion = exports.extendRegion = exports.isExtendedRegion = void 0;
var random_1 = require("support/util/random");
var arrays_1 = require("./arrays");
var RegionSelect_utils_1 = require("src/components/RegionSelect/RegionSelect.utils");
/**
 * Determines whether a region object is a `Region` or `ExtendedRegion` instance.
 *
 * @param region - `Region` or `ExtendedRegion` object.
 *
 * @returns `true` if `region` is an `ExtendedRegion` instance, `false` otherwise.
 */
var isExtendedRegion = function (region) {
    if ('apiLabel' in region) {
        return true;
    }
    return false;
};
exports.isExtendedRegion = isExtendedRegion;
/**
 * Returns an `ExtendedRegion` object for the given `Region`.
 *
 * If the given region object is already an `ExtendedRegion` (i.e. it has an
 * `apiLabel` property), then it will be returned unmodified.
 *
 * @param region - Region to extend.
 *
 * @returns `ExtendedRegion` object for `region`.
 */
var extendRegion = function (region) {
    if (!(0, exports.isExtendedRegion)(region)) {
        return __assign(__assign({}, region), { label: (0, RegionSelect_utils_1.getNewRegionLabel)(region), apiLabel: region.label });
    }
    return region;
};
exports.extendRegion = extendRegion;
/**
 * Returns a `Region` object for the given `ExtendedRegion`.
 *
 * @param extendedRegion - Extended region from which to create `Region`.
 *
 * @returns `Region` object for `extendedRegion`.
 */
var getRegionFromExtendedRegion = function (extendedRegion) {
    return {
        id: extendedRegion.id,
        label: extendedRegion.apiLabel,
        country: extendedRegion.country,
        capabilities: extendedRegion.capabilities,
        placement_group_limits: extendedRegion.placement_group_limits,
        status: extendedRegion.status,
        resolvers: extendedRegion.resolvers,
        site_type: extendedRegion.site_type,
    };
};
exports.getRegionFromExtendedRegion = getRegionFromExtendedRegion;
/**
 * Regions that cannot be selected using `chooseRegion()` and `chooseRegions()`.
 *
 * This is useful for regions which have capabilities that are required for tests,
 * but do not have capacity, resulting in 400 responses from the API.
 *
 * In the future we may be able to leverage the API to dynamically exclude regions
 * that are lacking capacity.
 */
var disallowedRegionIds = [
    // Tokyo, JP
    'ap-northeast',
    // Washington, DC
    'us-iad',
];
/**
 * Returns an object describing a Cloud Manager region if specified by the user.
 *
 * If the user has not specified an override region to use, `undefined` is
 * returned.
 *
 * @returns Override Cloud Manager region, or `undefined`.
 */
var getOverrideRegion = function () {
    var overrideRegionId = Cypress.env('CY_TEST_REGION');
    try {
        return (0, exports.getRegionById)(overrideRegionId);
    }
    catch (e) {
        return undefined;
    }
};
exports.getOverrideRegion = getOverrideRegion;
/**
 * All Linode regions available to the current Cloud Manager user.
 *
 * Retrieved via Linode APIv4 during Cypress start-up.
 */
exports.regions = Cypress.env('cloudManagerRegions');
/**
 * Linode region(s) exposed to Cypress for testing.
 *
 * This may be a subset of `regions` in order to test functionality for specific
 * regions.
 */
var getTestableRegions = function () {
    var overrideRegion = (0, exports.getOverrideRegion)();
    if (overrideRegion) {
        return [overrideRegion];
    }
    return exports.regions;
};
exports.getTestableRegions = getTestableRegions;
/**
 * Returns an object describing a Cloud Manager region with the given ID.
 *
 * If no known region exists with the given ID, an error is thrown.
 *
 * @param id - ID of the region to find.
 * @param searchRegions - Optional array of Regions from which to search.
 *
 * @throws When no region exists in the `regions` array with the given ID.
 *
 * @returns Extended Cloud Manager Region instance for region with the given ID.
 */
var getRegionById = function (id, searchRegions) {
    var region = (searchRegions !== null && searchRegions !== void 0 ? searchRegions : exports.regions).find(function (findRegion) { return findRegion.id === id; });
    if (!region) {
        throw new Error("Unable to find region by ID. Unknown ID '".concat(id, "'."));
    }
    return (0, exports.extendRegion)(region);
};
exports.getRegionById = getRegionById;
/**
 * Returns an object describing a Cloud Manager region with the given label.
 *
 * If no known region exists with the given human-readable label, an error is
 * thrown.
 *
 * @param label - Label (API or Cloud-specific) of the region to find.
 * @param searchRegions - Optional array of Regions from which to search.
 *
 * @throws When no region exists in the `regions` array with the given label.
 */
var getRegionByLabel = function (label, searchRegions) {
    var region = (searchRegions !== null && searchRegions !== void 0 ? searchRegions : exports.regions).find(function (findRegion) {
        var extendedFindRegion = (0, exports.extendRegion)(findRegion);
        return (extendedFindRegion.label === label ||
            extendedFindRegion.apiLabel === label);
    });
    if (!region) {
        throw new Error("Unable to find region by label. Unknown region label '".concat(label, "'."));
    }
    return (0, exports.extendRegion)(region);
};
exports.getRegionByLabel = getRegionByLabel;
/**
 * Returns `true` if the given Region has all of the given capabilities.
 *
 * @param region - Region to check capabilities.
 * @param capabilities - Capabilities to check.
 *
 * @returns `true` if `region` has all of the given capabilities.
 */
var regionHasCapabilities = function (region, capabilities) {
    return capabilities.every(function (capability) {
        return region.capabilities.includes(capability);
    });
};
/**
 * Returns an array of Region objects that have all of the given capabilities.
 *
 * @param regions - Regions from which to search.
 * @param capabilities - Capabilities to check.
 *
 * @returns Array of Region objects containing the required capabilities.
 */
var regionsWithCapabilities = function (regions, capabilities) {
    return regions.filter(function (region) {
        return regionHasCapabilities(region, capabilities);
    });
};
/**
 * Returns an array of Region objects that meet the given criteria.
 *
 * @param options - Object describing Region selection criteria.
 * @param detectOverrideRegion - Whether override region should be detected and applied.
 *
 * @throws If no regions meet the desired criteria.
 * @throws If an override region is specified which does not meet the given criteria.
 *
 * @returns Array of Region objects that meet criteria specified by `options` param.
 */
var resolveSearchRegions = function (options, detectOverrideRegion) {
    var _a, _b;
    if (detectOverrideRegion === void 0) { detectOverrideRegion = true; }
    var requiredCapabilities = (_a = options === null || options === void 0 ? void 0 : options.capabilities) !== null && _a !== void 0 ? _a : [];
    var overrideRegion = (0, exports.getOverrideRegion)();
    // If the user has specified an override region for this run, it takes precedent
    // over any other specified criteria.
    if (overrideRegion && detectOverrideRegion) {
        // TODO Consider skipping instead of failing when test isn't applicable to override region.
        if (!regionHasCapabilities(overrideRegion, requiredCapabilities)) {
            throw new Error("Override region ".concat(overrideRegion.id, " (").concat(overrideRegion.label, ") does not support one or more capabilities: ").concat(requiredCapabilities.join(', ')));
        }
        if (disallowedRegionIds.includes(overrideRegion.id)) {
            throw new Error("Override region ".concat(overrideRegion.id, " (").concat(overrideRegion.label, ") is disallowed for testing due to capacity limitations."));
        }
        return [overrideRegion];
    }
    var capableRegions = regionsWithCapabilities((_b = options === null || options === void 0 ? void 0 : options.regions) !== null && _b !== void 0 ? _b : exports.regions, requiredCapabilities).filter(function (region) { return !disallowedRegionIds.includes(region.id); });
    if (!capableRegions.length) {
        throw new Error("No regions are available with the required capabilities: ".concat(requiredCapabilities.join(', ')));
    }
    return capableRegions;
};
/**
 * Returns a known Cloud Manager region at random, or returns a user-chosen
 * region if one was specified.
 *
 * Region selection can be overridden via the `CY_TEST_REGION` environment
 * variable.
 *
 * @param options - Region selection options.
 *
 * @returns Object describing a Cloud Manager region to use during tests.
 */
var chooseRegion = function (options) {
    return (0, exports.extendRegion)((0, random_1.randomItem)(resolveSearchRegions(options)));
};
exports.chooseRegion = chooseRegion;
/**
 * Returns an array of unique Cloud Manager regions at random.
 *
 * If an override region is defined via the `CY_TEST_REGION` environment
 * variable, the first item in the array will be the override region, and
 * subsequent items will be chosen at random.
 *
 * @param count - Number of Regions to include in the returned array.
 * @param options - Region selection options.
 *
 * @throws When `count` is less than 0.
 * @throws When there are not enough regions to satisfy the given `count`.
 *
 * @returns Array of Cloud Manager Region objects.
 */
var chooseRegions = function (count, options) {
    if (count < 0) {
        throw new Error('Unable to choose regions. The desired number of regions must be 0 or greater');
    }
    var searchRegions = __spreadArray(__spreadArray([], (0, arrays_1.shuffleArray)(resolveSearchRegions(options, false)), true), ((0, exports.getOverrideRegion)() ? resolveSearchRegions(options, true) : []), true);
    if (searchRegions.length < count) {
        throw new Error("Unable to choose regions. The desired number of regions exceeds the number of known regions that meet the required criteria (".concat(exports.regions.length, ")"));
    }
    return (0, arrays_1.buildArray)(count, function () { return (0, exports.extendRegion)(searchRegions.pop()); });
};
exports.chooseRegions = chooseRegions;
/**
 * Executes a test for each Linode region exposed to Cypress.
 */
var testRegions = function (description, testCallback) {
    (0, exports.getTestableRegions)().forEach(function (region) {
        it("".concat(description, " (").concat(region.id, ")"), function () { return testCallback(region); });
    });
};
exports.testRegions = testRegions;
/**
 * Describes a group of test runs for each Linode region exposed to Cypress.
 */
var describeRegions = function (description, describeCallback) {
    (0, exports.getTestableRegions)().forEach(function (region) {
        describe("".concat(description, " (").concat(region.id, ")"), function () { return describeCallback(region); });
    });
};
exports.describeRegions = describeRegions;
