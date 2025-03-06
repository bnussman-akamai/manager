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
exports.fetchLinodeConfigs = exports.createTestLinode = exports.defaultCreateTestLinodeOptions = exports.linodeVlanNoInternetConfig = void 0;
var api_v4_1 = require("@linode/api-v4");
var factories_1 = require("@src/factories");
var firewalls_1 = require("support/api/firewalls");
var vlans_1 = require("support/api/vlans");
var api_1 = require("support/constants/api");
var backoff_1 = require("support/util/backoff");
var polling_1 = require("support/util/polling");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var paginate_1 = require("./paginate");
/**
 * Linode create interface to configure a Linode with no public internet access.
 */
exports.linodeVlanNoInternetConfig = [
    {
        ipam_address: null,
        label: (0, random_1.randomLabel)(),
        primary: false,
        purpose: 'vlan',
    },
];
/**
 * Default test Linode creation options.
 */
exports.defaultCreateTestLinodeOptions = {
    securityMethod: 'firewall',
    waitForBoot: false,
    waitForDisks: false,
};
/**
 * Creates a Linode to use during tests.
 *
 * @param createRequestPayload - Partial Linode request payload to override default payload.
 * @param options - Linode create and polling options.
 *
 * @returns Promise that resolves to the created Linode.
 */
var createTestLinode = function (createRequestPayload, options) { return __awaiter(void 0, void 0, void 0, function () {
    var resolvedOptions, regionId, securityMethodPayload, resolvedCreatePayload, linode;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                resolvedOptions = __assign(__assign({}, exports.defaultCreateTestLinodeOptions), (options || {}));
                regionId = createRequestPayload === null || createRequestPayload === void 0 ? void 0 : createRequestPayload.region;
                if (!regionId) {
                    regionId = (0, regions_1.chooseRegion)().id;
                }
                return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, firewall, vlanConfig, vlanLabel;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = resolvedOptions.securityMethod;
                                    switch (_a) {
                                        case 'firewall': return [3 /*break*/, 1];
                                        case 'vlan_no_internet': return [3 /*break*/, 3];
                                        case 'powered_off': return [3 /*break*/, 5];
                                    }
                                    return [3 /*break*/, 1];
                                case 1: return [4 /*yield*/, (0, firewalls_1.findOrCreateDependencyFirewall)()];
                                case 2:
                                    firewall = _b.sent();
                                    return [2 /*return*/, {
                                            firewall_id: firewall.id,
                                        }];
                                case 3:
                                    vlanConfig = exports.linodeVlanNoInternetConfig;
                                    return [4 /*yield*/, (0, vlans_1.findOrCreateDependencyVlan)(regionId)];
                                case 4:
                                    vlanLabel = _b.sent();
                                    vlanConfig[0].label = vlanLabel;
                                    return [2 /*return*/, {
                                            interfaces: vlanConfig,
                                        }];
                                case 5: return [2 /*return*/, {
                                        booted: false,
                                    }];
                            }
                        });
                    }); })()];
            case 1:
                securityMethodPayload = _a.sent();
                resolvedCreatePayload = __assign(__assign(__assign(__assign({}, factories_1.createLinodeRequestFactory.build({
                    booted: false,
                    image: 'linode/ubuntu24.04',
                    label: (0, random_1.randomLabel)(),
                    region: regionId,
                })), (createRequestPayload || {})), securityMethodPayload), { 
                    // Override given root password; mitigate against using default factory password, inadvertent logging, etc.
                    root_pass: (0, random_1.randomString)(64, {
                        lowercase: true,
                        numbers: true,
                        spaces: true,
                        symbols: true,
                        uppercase: true,
                    }) });
                // Display warnings for certain combinations of options/request payloads...
                if (resolvedOptions.waitForDisks && resolvedOptions.waitForBoot) {
                    console.warn('Ignoring `waitForDisks` option because `waitForBoot` takes precedence.');
                }
                if (!resolvedCreatePayload.booted && resolvedOptions.waitForBoot) {
                    console.warn('Using `waitForBoot` option when Linode payload `booted` is false will cause a timeout.');
                }
                return [4 /*yield*/, (0, api_v4_1.createLinode)(resolvedCreatePayload)];
            case 2:
                linode = _a.sent();
                if (!(resolvedOptions.waitForDisks && !resolvedOptions.waitForBoot)) return [3 /*break*/, 4];
                // Wait 7.5 seconds before initial check, then poll again every 5 seconds.
                return [4 /*yield*/, (0, polling_1.pollLinodeDiskStatuses)(linode.id, 'ready', new backoff_1.SimpleBackoffMethod(5000, {
                        initialDelay: 7500,
                        maxAttempts: 25,
                    }))];
            case 3:
                // Wait 7.5 seconds before initial check, then poll again every 5 seconds.
                _a.sent();
                _a.label = 4;
            case 4:
                if (!resolvedOptions.waitForBoot) return [3 /*break*/, 6];
                return [4 /*yield*/, (0, polling_1.pollLinodeStatus)(linode.id, 'running')];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                Cypress.log({
                    consoleProps: function () {
                        return {
                            linode: linode,
                            options: resolvedOptions,
                            payload: __assign(__assign({}, resolvedCreatePayload), { root_pass: '(redacted)' }),
                        };
                    },
                    message: "Create Linode '".concat(linode.label, "' (ID ").concat(linode.id, ")"),
                    name: 'createTestLinode',
                });
                return [2 /*return*/, __assign(__assign({}, linode), { capabilities: [] })];
        }
    });
}); };
exports.createTestLinode = createTestLinode;
/**
 * Retrieves all Config objects belonging to a Linode.
 *
 * @param linodeId - ID of Linode for which to retrieve Configs.
 *
 * @returns Promise that resolves to an array of Config objects for the given Linode.
 */
var fetchLinodeConfigs = function (linodeId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, paginate_1.depaginate)(function (page) {
                return (0, api_v4_1.getLinodeConfigs)(linodeId, { page: page, page_size: api_1.pageSize });
            })];
    });
}); };
exports.fetchLinodeConfigs = fetchLinodeConfigs;
