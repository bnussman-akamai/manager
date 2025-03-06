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
exports.postRunCleanup = void 0;
var luxon_1 = require("luxon");
var paginate_1 = require("../util/paginate");
var api_v4_1 = require("@linode/api-v4");
// TODO Refactor to use utilities after M3-8803.
/*
 * Cypress configuration and plugins are executed in Node.js where our
 * path aliases `support`, `src`/`@src`, etc., are unavailable. Additionally,
 * some Cypress-specific objects like `cy` and `Cypress` are unavailable.
 *
 * As a result, we cannot import any code which uses aliases, uses `cy`/`Cypress`,
 * or imports any code which does (and so on...) from here. Because of this
 * limitation, we can't import our existing utilities related to resource clean
 * up and sadly must re-implement them here.
 *
 * M3-8803 seeks to reorganize our utilities to better distinguish which code
 * is executed and expected to be available where, and after that point we
 * should be able to refactor this plugin to take advantage of existing utilities
 * like `deleteAllTestLinodes`, `deleteAllTestFirewalls`, etc.
 */
// Test resource label/name prefix.
var TEST_TAG_PREFIX = 'cy-test-';
// Desired number of items per page of a paginated API request.
var PAGE_SIZE = 500;
/*
 * Determines if the given node pool is ready by checking the status of each node.
 */
var isPoolReady = function (pool) {
    return pool.nodes.every(function (node) { return node.status === 'ready'; });
};
/**
 * Deletes all test Linodes on the test account.
 *
 * This is a re-implementation of an existing util, `deleteAllTestLinodes`, in
 * `support/api/linodes.ts`.
 *
 * @returns Promise that resolves when all test Linodes are deleted.
 */
var deleteTestLinodes = function () { return __awaiter(void 0, void 0, void 0, function () {
    var allLinodes, deletePromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, paginate_1.depaginate)(function (page) {
                    return (0, api_v4_1.getLinodes)({ page: page, page_size: PAGE_SIZE });
                })];
            case 1:
                allLinodes = _a.sent();
                deletePromises = allLinodes
                    .filter(function (linode) { return linode.label.startsWith(TEST_TAG_PREFIX); })
                    .map(function (linode) { return (0, api_v4_1.deleteLinode)(linode.id); });
                return [4 /*yield*/, Promise.all(deletePromises)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Deletes all test Firewalls on the test account.
 *
 * This is a re-implementation of an existing util, `deleteAllTestFirewalls`, in
 * `support/api/firewalls.ts`.
 *
 * @returns Promise that resolves when all test Firewalls are deleted.
 */
var deleteTestFirewalls = function () { return __awaiter(void 0, void 0, void 0, function () {
    var allFirewalls, deletePromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, paginate_1.depaginate)(function (page) {
                    return (0, api_v4_1.getFirewalls)({ page: page, page_size: PAGE_SIZE });
                })];
            case 1:
                allFirewalls = _a.sent();
                deletePromises = allFirewalls
                    .filter(function (firewall) { return firewall.label.startsWith(TEST_TAG_PREFIX); })
                    .map(function (firewall) { return (0, api_v4_1.deleteFirewall)(firewall.id); });
                return [4 /*yield*/, Promise.all(deletePromises)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Deletes all running test LKE clusters on the test account.
 *
 * Sometimes when attempting to delete provisioning LKE clusters, the cluster
 * becomes stuck and requires manual intervention to resolve. To reduce the risk
 * of this happening, this function will only delete clusters that have finished
 * provisioning (i.e. all nodes have `'ready'` status) or which have existed
 * for at least an hour.
 *
 * This is a re-implementation of an existing util, `deleteAllTestLkeClusters`, in
 * `support/api/lke.ts`.
 *
 * @returns Promise that resolves when all test LKE clusters are deleted.
 */
var deleteTestLkeClusters = function () { return __awaiter(void 0, void 0, void 0, function () {
    var allClusters, clusterDeletionPromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, paginate_1.depaginate)(function (page) {
                    return (0, api_v4_1.getKubernetesClusters)({ page: page, page_size: PAGE_SIZE });
                })];
            case 1:
                allClusters = _a.sent();
                clusterDeletionPromises = allClusters
                    .filter(function (cluster) {
                    return cluster.label.startsWith(TEST_TAG_PREFIX);
                })
                    .map(function (cluster) { return __awaiter(void 0, void 0, void 0, function () {
                    var clusterCreateTime, createTimeElapsed, pools;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                clusterCreateTime = luxon_1.DateTime.fromISO(cluster.created, {
                                    zone: 'utc',
                                });
                                createTimeElapsed = Math.abs(clusterCreateTime.diffNow('minutes').minutes);
                                // If the test cluster is older than 1 hour, delete it regardless of
                                // whether or not all of the Node Pools are ready; this is a safeguard
                                // to prevent LKE clusters with stuck pools from accumulating.
                                if (createTimeElapsed >= 60) {
                                    return [2 /*return*/, (0, api_v4_1.deleteKubernetesCluster)(cluster.id)];
                                }
                                return [4 /*yield*/, (0, paginate_1.depaginate)(function (page) {
                                        return (0, api_v4_1.getNodePools)(cluster.id, { page: page, page_size: PAGE_SIZE });
                                    })];
                            case 1:
                                pools = _a.sent();
                                if (pools.every(isPoolReady)) {
                                    return [2 /*return*/, (0, api_v4_1.deleteKubernetesCluster)(cluster.id)];
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(clusterDeletionPromises)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/*
 * Human-friendly string describing the types of resources being deleted,
 * and their corresponding deletion function.
 */
var resourceCleanUpItems = [
    { name: 'Linodes', cleanUp: deleteTestLinodes },
    // TODO Remove LKE cluster clean up once M3-8656 is complete because cluster cleanup will no longer be necessary.
    { name: 'LKE Clusters', cleanUp: deleteTestLkeClusters },
    { name: 'Firewalls', cleanUp: deleteTestFirewalls },
];
var postRunCleanup = function (on) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        on('after:run', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _i, resourceCleanUpItems_1, resourceCleanUpItem, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Performing post-run clean up:\n');
                        _i = 0, resourceCleanUpItems_1 = resourceCleanUpItems;
                        _a.label = 1;
                    case 1:
                        if (!(_i < resourceCleanUpItems_1.length)) return [3 /*break*/, 6];
                        resourceCleanUpItem = resourceCleanUpItems_1[_i];
                        console.log("- Cleaning up test ".concat(resourceCleanUpItem.name, "..."));
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        // Perform clean-up sequentially.
                        // eslint-disable-next-line no-await-in-loop
                        return [4 /*yield*/, resourceCleanUpItem.cleanUp()];
                    case 3:
                        // Perform clean-up sequentially.
                        // eslint-disable-next-line no-await-in-loop
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.error("\nAn error occurred while cleaning up test ".concat(resourceCleanUpItem.name, ":"));
                        if (e_1.message) {
                            console.error(e_1.message);
                        }
                        console.error(e_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        console.log('\nPost-run clean up is complete');
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); };
exports.postRunCleanup = postRunCleanup;
