"use strict";
/**
 * @file Utilities for polling APIs and other resources.
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
exports.pollVolumeStatus = exports.pollImageStatus = exports.pollLinodeDiskSize = exports.pollLinodeDiskStatuses = exports.pollLinodeStatus = exports.poll = void 0;
var api_1 = require("support/constants/api");
var api_v4_1 = require("@linode/api-v4");
var backoff_1 = require("./backoff");
var paginate_1 = require("./paginate");
var linodes_1 = require("support/constants/linodes");
// Default backoff options for a poll.
var defaultBackoffOptions = {
    initialDelay: 0,
    maxAttempts: 10,
};
// Default backoff method for a poll, which uses the default backoff options.
var defaultBackoffMethod = new backoff_1.FibonacciBackoffMethod(defaultBackoffOptions);
/**
 * Executes a callback repeatedly until a desired result is achieved.
 *
 * Fibonacci backoff is used to increase time between subsequent attempts in
 * order to avoid overloading remote resources.
 *
 * @param callback - Callback that returns a Promise to retrieve some data.
 * @param evaluator - Callback to evaluate whether the data matches some condition.
 * @param backoffOptions - Backoff method configuration to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the retrieved result upon successful evaluation or rejects on timeout.
 */
var poll = function (callback_1, evaluator_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([callback_1, evaluator_1], args_1, true), void 0, function (callback, evaluator, backoffOptions, label) {
        var pollPromise, backoff, result, _e_1, errorMessage;
        if (backoffOptions === void 0) { backoffOptions = undefined; }
        if (label === void 0) { label = undefined; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pollPromise = function () { return __awaiter(void 0, void 0, void 0, function () {
                        var result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, callback()];
                                case 1:
                                    result = _a.sent();
                                    if (evaluator(result)) {
                                        return [2 /*return*/, result];
                                    }
                                    else {
                                        throw new Error();
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    backoff = (function () {
                        if (backoffOptions instanceof backoff_1.BackoffMethod) {
                            return backoffOptions;
                        }
                        if (backoffOptions === undefined) {
                            return defaultBackoffMethod;
                        }
                        return new backoff_1.FibonacciBackoffMethod(__assign(__assign({}, defaultBackoffOptions), backoffOptions));
                    })();
                    result = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, backoff_1.attemptWithBackoff)(backoff, pollPromise)];
                case 2:
                    result = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _e_1 = _a.sent();
                    errorMessage = label
                        ? "Poll '".concat(label, "' failed after ").concat(backoff.options.maxAttempts, " attempt(s)")
                        : "Poll failed after ".concat(backoff.options.maxAttempts, " attempt(s)");
                    throw new Error(errorMessage);
                case 4: return [2 /*return*/, result];
            }
        });
    });
};
exports.poll = poll;
/**
 * Polls a Linode with the given ID until it has the given status.
 *
 * By default, polling will occur after 15 seconds have passed, and reattempts
 * occur on a 5-second interval until the default Linode create timeout is reached.
 * This behavior can be customized by passing an alternative `backoffMethod`.
 *
 * @param linodeId - ID of Linode to poll.
 * @param desiredStatus - Desired status of Linode that is being polled.
 * @param backoffMethod - Optional backoff method for reattempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the polled Linode's status or rejects on timeout.
 */
var pollLinodeStatus = function (linodeId_1, desiredStatus_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([linodeId_1, desiredStatus_1], args_1, true), void 0, function (linodeId, desiredStatus, backoffOptions, label) {
        var getLinodeStatus, initialDelay, interval, maxAttempts, defaultBackoffMethod, backoff, checkLinodeStatus;
        if (backoffOptions === void 0) { backoffOptions = undefined; }
        if (label === void 0) { label = undefined; }
        return __generator(this, function (_a) {
            getLinodeStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
                var linode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, api_v4_1.getLinode)(linodeId)];
                        case 1:
                            linode = _a.sent();
                            return [2 /*return*/, linode.status];
                    }
                });
            }); };
            initialDelay = 15000;
            interval = 5000;
            maxAttempts = Math.ceil((linodes_1.LINODE_CREATE_TIMEOUT - initialDelay) / interval);
            defaultBackoffMethod = new backoff_1.SimpleBackoffMethod(interval, {
                initialDelay: initialDelay,
                maxAttempts: maxAttempts,
            });
            backoff = backoffOptions ? backoffOptions : defaultBackoffMethod;
            checkLinodeStatus = function (status) {
                return status === desiredStatus;
            };
            return [2 /*return*/, (0, exports.poll)(getLinodeStatus, checkLinodeStatus, backoff, label)];
        });
    });
};
exports.pollLinodeStatus = pollLinodeStatus;
/**
 * Polls the status of a Linode's disks until all of them are in the desired state.
 *
 * @param linodeId - ID of Linode containing the disks to poll.
 * @param desiredStatus - Desired status of the disks that are being polled.
 * @param backoffMethod - Backoff method implementation to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to an array of disks or rejects on timeout.
 */
var pollLinodeDiskStatuses = function (linodeId_1, desiredStatus_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([linodeId_1, desiredStatus_1], args_1, true), void 0, function (linodeId, desiredStatus, backoffOptions, label) {
        var getDisks, checkDisksStatus;
        if (backoffOptions === void 0) { backoffOptions = undefined; }
        if (label === void 0) { label = undefined; }
        return __generator(this, function (_a) {
            getDisks = function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, (0, paginate_1.depaginate)(function (page) {
                            return (0, api_v4_1.getLinodeDisks)(linodeId, { page: page, page_size: api_1.pageSize });
                        })];
                });
            }); };
            checkDisksStatus = function (disks) {
                return disks.every(function (disk) { return disk.status === desiredStatus; });
            };
            return [2 /*return*/, (0, exports.poll)(getDisks, checkDisksStatus, backoffOptions, label)];
        });
    });
};
exports.pollLinodeDiskStatuses = pollLinodeDiskStatuses;
/**
 * Polls the size of a Linode disk until it is the given size.
 *
 * Useful when waiting for a disk resize to complete.
 *
 * @param linodeId - ID of Linode containing the disk to poll.
 * @param diskId - ID of the disk to poll.
 * @param desiredSize - Desired size of the disk that is being polled.
 * @param backoffMethod - Backoff method implementation to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the polled disk's size or rejects on timeout.
 */
var pollLinodeDiskSize = function (linodeId_1, diskId_1, desiredSize_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([linodeId_1, diskId_1, desiredSize_1], args_1, true), void 0, function (linodeId, diskId, desiredSize, backoffOptions, label) {
        var getDiskSize, checkDiskSize;
        if (backoffOptions === void 0) { backoffOptions = undefined; }
        if (label === void 0) { label = undefined; }
        return __generator(this, function (_a) {
            getDiskSize = function () { return __awaiter(void 0, void 0, void 0, function () {
                var disk;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, api_v4_1.getLinodeDisk)(linodeId, diskId)];
                        case 1:
                            disk = _a.sent();
                            return [2 /*return*/, disk.size];
                    }
                });
            }); };
            checkDiskSize = function (size) { return size === desiredSize; };
            return [2 /*return*/, (0, exports.poll)(getDiskSize, checkDiskSize, backoffOptions, label)];
        });
    });
};
exports.pollLinodeDiskSize = pollLinodeDiskSize;
/**
 * Polls an Image with the given ID until it has the given status.
 *
 * @param imageId - ID of Image to poll.
 * @param desiredStatus - Desired status of Image that is being polled.
 * @param backoffMethod - Backoff method implementation to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the polled Image's status or rejects on timeout.
 */
var pollImageStatus = function (imageId_1, desiredStatus_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([imageId_1, desiredStatus_1], args_1, true), void 0, function (imageId, desiredStatus, backoffOptions, label) {
        var getImageStatus, checkImageStatus;
        if (backoffOptions === void 0) { backoffOptions = undefined; }
        if (label === void 0) { label = undefined; }
        return __generator(this, function (_a) {
            getImageStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
                var image;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, api_v4_1.getImage)(imageId)];
                        case 1:
                            image = _a.sent();
                            return [2 /*return*/, image.status];
                    }
                });
            }); };
            checkImageStatus = function (status) {
                return status === desiredStatus;
            };
            return [2 /*return*/, (0, exports.poll)(getImageStatus, checkImageStatus, backoffOptions, label)];
        });
    });
};
exports.pollImageStatus = pollImageStatus;
/**
 * Polls a Volume with the given ID until it has the given status.
 *
 * @param volumeId - ID of Volume to poll.
 * @param desiredStatus - Desired status of Volume that is being polled.
 * @param backoffMethod - Backoff method implementation to manage re-attempts.
 * @param label - Optional label to assign to poll for logging and troubleshooting.
 *
 * @returns A Promise that resolves to the polled Volume's status or rejects on timeout.
 */
var pollVolumeStatus = function (volumeId_1, desiredStatus_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([volumeId_1, desiredStatus_1], args_1, true), void 0, function (volumeId, desiredStatus, backoffOptions, label) {
        var getVolumeStatus, checkVolumeStatus;
        if (backoffOptions === void 0) { backoffOptions = undefined; }
        if (label === void 0) { label = undefined; }
        return __generator(this, function (_a) {
            getVolumeStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
                var volume;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, api_v4_1.getVolume)(volumeId)];
                        case 1:
                            volume = _a.sent();
                            return [2 /*return*/, volume.status];
                    }
                });
            }); };
            checkVolumeStatus = function (status) {
                return status === desiredStatus;
            };
            return [2 /*return*/, (0, exports.poll)(getVolumeStatus, checkVolumeStatus, backoffOptions, label)];
        });
    });
};
exports.pollVolumeStatus = pollVolumeStatus;
