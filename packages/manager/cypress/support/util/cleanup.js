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
exports.cleanUp = void 0;
var domains_1 = require("support/api/domains");
var entityTransfer_1 = require("support/api/entityTransfer");
var firewalls_1 = require("support/api/firewalls");
var images_1 = require("support/api/images");
var linodes_1 = require("support/api/linodes");
var lke_1 = require("support/api/lke");
var longview_1 = require("support/api/longview");
var nodebalancers_1 = require("support/api/nodebalancers");
var objectStorage_1 = require("support/api/objectStorage");
var stackscripts_1 = require("support/api/stackscripts");
var tags_1 = require("support/api/tags");
var volumes_1 = require("support/api/volumes");
var profile_1 = require("support/api/profile");
// Map `CleanUpResource` strings to the clean up functions they execute.
var cleanUpMap = {
    domains: function () { return (0, domains_1.deleteAllTestDomains)(); },
    firewalls: function () { return (0, firewalls_1.deleteAllTestFirewalls)(); },
    images: function () { return (0, images_1.deleteAllTestImages)(); },
    linodes: function () { return (0, linodes_1.deleteAllTestLinodes)(); },
    'lke-clusters': function () { return (0, lke_1.deleteAllTestLkeClusters)(); },
    'longview-clients': function () { return (0, longview_1.deleteAllTestClients)(); },
    'node-balancers': function () { return (0, nodebalancers_1.deleteAllTestNodeBalancers)(); },
    'obj-access-keys': function () { return (0, objectStorage_1.deleteAllTestAccessKeys)(); },
    'obj-buckets': function () { return (0, objectStorage_1.deleteAllTestBuckets)(); },
    'service-transfers': function () { return (0, entityTransfer_1.cancelAllTestEntityTransfers)(); },
    stackscripts: function () { return (0, stackscripts_1.deleteAllTestStackScripts)(); },
    'ssh-keys': function () { return (0, profile_1.deleteAllTestSSHKeys)(); },
    tags: function () { return (0, tags_1.deleteAllTestTags)(); },
    volumes: function () { return (0, volumes_1.deleteAllTestVolumes)(); },
};
/**
 * Cleans up test resources of the given type(s).
 *
 * @param resources - Types of resources to clean up.
 *
 * @example
 * await cleanUp('linodes'); // Clean up a single type of resource.
 * await cleanUp(['linodes', 'volumes']); // Clean up Linodes and then Volumes.
 *
 * @returns Promise that resolves when desired resources are cleaned up.
 */
var cleanUp = function (resources) {
    var resourcesArray = Array.isArray(resources) ? resources : [resources];
    var promiseGenerator = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, resourcesArray_1, resource, cleanFunction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, resourcesArray_1 = resourcesArray;
                    _a.label = 1;
                case 1:
                    if (!(_i < resourcesArray_1.length)) return [3 /*break*/, 4];
                    resource = resourcesArray_1[_i];
                    cleanFunction = cleanUpMap[resource];
                    // Perform clean-up sequentially to avoid API rate limiting.
                    // eslint-disable-next-line no-await-in-loop
                    return [4 /*yield*/, cleanFunction()];
                case 2:
                    // Perform clean-up sequentially to avoid API rate limiting.
                    // eslint-disable-next-line no-await-in-loop
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return cy.defer(promiseGenerator, "cleaning up test resources: ".concat(resourcesArray.join(', ')));
};
exports.cleanUp = cleanUp;
