"use strict";
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
exports.createDomain = exports.deleteAllTestDomains = void 0;
var api_v4_1 = require("@linode/api-v4");
var common_1 = require("support/api/common");
var api_1 = require("support/constants/api");
var paginate_1 = require("support/util/paginate");
var random_1 = require("support/util/random");
var factories_1 = require("src/factories");
var common_2 = require("./common");
/**
 * Deletes all domains which are prefixed with the test entity prefix.
 *
 * @returns Promise that resolves when domains have been deleted.
 */
var deleteAllTestDomains = function () { return __awaiter(void 0, void 0, void 0, function () {
    var domains, deletionPromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, paginate_1.depaginate)(function (page) {
                    return (0, api_v4_1.getDomains)({ page: page, page_size: api_1.pageSize });
                })];
            case 1:
                domains = _a.sent();
                deletionPromises = domains
                    .filter(function (domain) { return (0, common_1.isTestLabel)(domain.domain); })
                    .map(function (domain) { return (0, api_v4_1.deleteDomain)(domain.id); });
                return [4 /*yield*/, Promise.all(deletionPromises)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteAllTestDomains = deleteAllTestDomains;
var makeDomainCreateReq = function (domainPayload) {
    var domainData = domainPayload
        ? domainPayload
        : factories_1.createDomainPayloadFactory.build({
            domain: (0, random_1.randomDomainName)(),
            soa_email: 'admin@example.com',
            type: 'master',
        });
    return cy.request({
        auth: {
            bearer: api_1.oauthToken,
        },
        body: domainData,
        method: 'POST',
        url: Cypress.env('REACT_APP_API_ROOT') + '/domains',
    });
};
/**
 * Use this method if you do not need to get the request detail
 * @param domain if undefined will use default
 * @returns domain object
 */
var createDomain = function (domain) {
    return makeDomainCreateReq(domain).then(function (resp) {
        (0, common_2.apiCheckErrors)(resp);
        console.log("Created Domain ".concat(resp.body.label, " successfully"), resp);
        return resp.body;
    });
};
exports.createDomain = createDomain;
