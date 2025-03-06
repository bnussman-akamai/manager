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
exports.fetchAccount = void 0;
var path_1 = require("path");
var api_v4_1 = require("@linode/api-v4");
var fs_1 = require("fs");
/**
 * The name of the environment variable that controls account cache reading.
 */
var envVarName = 'CY_TEST_ACCOUNT_CACHE_DIR';
/**
 * Fetches and caches Linode account info and settings.
 *
 * Cached account data is stored in Cypress's `cloudManagerAccount` and
 * `cloudManagerAccountSettings` env, respectively.
 */
var fetchAccount = function (_on, config) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, profile, accountSettings, accountCacheData, account, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    (0, api_v4_1.getProfile)(),
                    (0, api_v4_1.getAccountSettings)(),
                ])];
            case 1:
                _a = _b.sent(), profile = _a[0], accountSettings = _a[1];
                accountCacheData = (function () {
                    if (!config.env[envVarName]) {
                        return undefined;
                    }
                    var accountCacheDir = config.env[envVarName];
                    var accountCachePath = (0, path_1.resolve)((0, path_1.join)(accountCacheDir, "".concat(profile.uid, ".json")));
                    try {
                        var cacheJson = (0, fs_1.readFileSync)(accountCachePath, 'utf8');
                        var cacheData = JSON.parse(cacheJson);
                        if ('account' in cacheData) {
                            var accountCache = cacheData['account'];
                            return accountCache;
                        }
                    }
                    catch (e) {
                        // TODO Error message.
                        console.error("Failed to read account cache file at ".concat(accountCachePath));
                        if ('message' in e) {
                            console.error(e.message);
                        }
                        return undefined;
                    }
                    return undefined;
                })();
                account = undefined;
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, api_v4_1.getAccountInfo)()];
            case 3:
                account = _b.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _b.sent();
                console.error('An error occurred while retrieving test account information.');
                // Re-throw the error if no cached account data is available, because the
                // test run cannot continue.
                if (!accountCacheData) {
                    throw e_1;
                }
                // Otherwise, note that the original account fetch failed and that the tests
                // will be proceeding using cached data.
                else {
                    if (e_1.message) {
                        console.error(e_1.message);
                    }
                    console.info('Cached account data is available and will be used instead.');
                }
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, __assign(__assign({}, config), { env: __assign(__assign({}, config.env), { cloudManagerAccount: account || accountCacheData, cloudManagerAccountSettings: accountSettings }) })];
        }
    });
}); };
exports.fetchAccount = fetchAccount;
