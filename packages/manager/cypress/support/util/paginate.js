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
exports.paginateResponse = exports.depaginate = exports.paginate = void 0;
/**
 * Paginates the given data.
 *
 * @param data - Object or array of objects for paginated data.
 *
 * @returns Paginated data.
 */
var paginate = function (data) {
    var arrayData = Array.isArray(data) ? data : [data];
    return {
        data: arrayData,
        page: 1,
        pages: 1,
        results: arrayData.length,
    };
};
exports.paginate = paginate;
/**
 * Depaginates data from a function that returns paginated results.
 *
 * Accomplishes this by fetching the first page of results using the given
 * function, and fetching any remaining results if the first response does not
 * contain all of the data.
 *
 * @example
 * // Create a generator function, then use it to depaginate buckets.
 * const bucketsPage = (page: number) => getBuckets({ page });
 * const buckets: ObjectStorageBucket[] = await depaginate(bucketsPage);
 *
 * @param resultGenerator - A function which generates a paginated result.
 *
 * @returns Promise that resolves to an array of data.
 */
var depaginate = function (resultGenerator) { return __awaiter(void 0, void 0, void 0, function () {
    var firstResult, data, remainingResults, remainingResultsPromises, responseResults;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, resultGenerator(1)];
            case 1:
                firstResult = _a.sent();
                data = firstResult.data;
                if (!(firstResult.pages > 1)) return [3 /*break*/, 3];
                remainingResults = firstResult.pages - 1;
                remainingResultsPromises = Array(remainingResults)
                    .fill(null)
                    .map(function (_element, index) { return __awaiter(void 0, void 0, void 0, function () {
                    var pageNumber, results;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                pageNumber = index + 2;
                                return [4 /*yield*/, resultGenerator(pageNumber)];
                            case 1:
                                results = _a.sent();
                                return [2 /*return*/, results.data];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(remainingResultsPromises)];
            case 2:
                responseResults = (_a.sent()).reduce(function (acc, cur) {
                    return __spreadArray(__spreadArray([], acc, true), cur, true);
                }, []);
                return [2 /*return*/, __spreadArray(__spreadArray([], data, true), responseResults, true)];
            case 3: return [2 /*return*/, data];
        }
    });
}); };
exports.depaginate = depaginate;
/**
 * Creates an HTTP response object whose body contains paginated data.
 *
 * @param data - Object or array of objects for paginated data.
 * @param statusCode - Response HTTP status. Default is `200`.
 * @param page - Current page for paginated response. Default is `1`.
 * @param totalPages - Total pages for paginated response. Default is `1`.
 *
 * @returns Paginated HTTP response object.
 */
var paginateResponse = function (data, statusCode, page, totalPages) {
    if (statusCode === void 0) { statusCode = 200; }
    if (page === void 0) { page = 1; }
    if (totalPages === void 0) { totalPages = 1; }
    var dataArray = Array.isArray(data) ? data : [data];
    return {
        body: {
            data: dataArray,
            page: page,
            pages: totalPages,
            results: dataArray.length,
        },
        statusCode: statusCode,
    };
};
exports.paginateResponse = paginateResponse;
