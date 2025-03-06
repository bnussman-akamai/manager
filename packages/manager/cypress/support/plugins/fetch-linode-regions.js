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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLinodeRegions = exports.getCloudManagerLabel = void 0;
var api_v4_1 = require("@linode/api-v4");
// TODO Clean up.
/**
 * Returns Region label formatted for Cloud Manager UI.
 *
 * This is a re-implementation of a similar util in the Cloud Manager code base.
 * Because it is needed by our Cypress config, which does not go through Vite, we
 * have to re-implement this util rather than import it because Cloud Manager
 * source code cannot be imported without Vite.
 *
 * @see {@link src/components/RegionSelect/RegionSelect.utils}
 */
var getCloudManagerLabel = function (region) {
    var city = region.label.split(', ')[0];
    // Include state for the US
    if (region.country === 'us') {
        return "".concat(region.country.toUpperCase(), ", ").concat(region.label);
    }
    return "".concat(region.country.toUpperCase(), ", ").concat(city);
};
exports.getCloudManagerLabel = getCloudManagerLabel;
/**
 * Fetches Linode regions and stores data in Cypress `cloudManagerRegions` env.
 *
 * Throws an error if no OAuth token (used for regions API request) is defined.
 */
var fetchLinodeRegions = function (on, config) { return __awaiter(void 0, void 0, void 0, function () {
    var regions, extendedRegions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_v4_1.getRegions)({ page_size: 500 })];
            case 1:
                regions = _a.sent();
                extendedRegions = regions.data.map(function (apiRegion) {
                    return __assign(__assign({}, apiRegion), { label: (0, exports.getCloudManagerLabel)(apiRegion), apiLabel: apiRegion.label });
                });
                return [2 /*return*/, __assign(__assign({}, config), { env: __assign(__assign({}, config.env), { cloudManagerRegions: extendedRegions }) })];
        }
    });
}); };
exports.fetchLinodeRegions = fetchLinodeRegions;
