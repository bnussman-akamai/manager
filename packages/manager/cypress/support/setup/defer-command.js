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
var backoff_1 = require("support/util/backoff");
var linodes_1 = require("support/constants/linodes");
/**
 * Returns `true` if the given error is a Linode API schema validation error.
 *
 * Type guards `e` as an array of `APIError` objects.
 *
 * @param e - Error.
 *
 * @returns `true` if `e` is a Linode API schema validation error.
 */
var isValidationError = function (e) {
    // When a Linode APIv4 schema validation error occurs, an array of `APIError`
    // objects is thrown rather than a typical `Error` type.
    return (Array.isArray(e) &&
        e.every(function (item) {
            return 'reason' in item;
        }));
};
/**
 * Returns `true` if the given error is an Axios error.
 *
 * Type guards `e` as an `AxiosError` instance.
 *
 * @param e - Error.
 *
 * @returns `true` if `e` is an `AxiosError`.
 */
var isAxiosError = function (e) {
    return !!e.isAxiosError;
};
/**
 * Returns `true` if the given error is a Linode API v4 request error.
 *
 * Type guards `e` as an `AxiosError<LinodeApiV4Error>` instance.
 *
 * @param e - Error.
 *
 * @returns `true` if `e` is a Linode API v4 request error.
 */
var isLinodeApiError = function (e) {
    var _a;
    if (isAxiosError(e)) {
        var responseData = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data;
        return (responseData.errors &&
            Array.isArray(responseData.errors) &&
            responseData.errors.every(function (item) {
                return 'reason' in item;
            }));
    }
    return false;
};
/**
 * Detects known error types and returns a new Error with more detailed message.
 *
 * Unknown error types are returned without modification.
 *
 * @param e - Error.
 *
 * @returns A new error with added information in message, or `e`.
 */
var enhanceError = function (e) {
    var _a, _b, _c, _d, _e, _f;
    // Check for most specific error types first.
    if (isLinodeApiError(e)) {
        // If `e` is a Linode APIv4 error response, show the status code, error messages,
        // and request URL when applicable.
        var summary = !!((_a = e.response) === null || _a === void 0 ? void 0 : _a.status)
            ? "Linode APIv4 request failed with status code ".concat(e.response.status)
            : "Linode APIv4 request failed";
        var errorDetails = e.response.data.errors.map(function (error) {
            return error.field
                ? "- ".concat(error.reason, " (field '").concat(error.field, "')")
                : "- ".concat(error.reason);
        });
        var requestInfo = !!((_b = e.request) === null || _b === void 0 ? void 0 : _b.responseURL) && !!((_c = e.config) === null || _c === void 0 ? void 0 : _c.method)
            ? "\nRequest: ".concat(e.config.method.toUpperCase(), " ").concat(e.request.responseURL)
            : '';
        return new Error("".concat(summary, "\n").concat(errorDetails.join('\n')).concat(requestInfo));
    }
    if (isAxiosError(e)) {
        // If `e` is an Axios error (but not a Linode API error specifically), show the
        // status code, error messages, and request URL when applicable.
        var summary = !!((_d = e.response) === null || _d === void 0 ? void 0 : _d.status)
            ? "Request failed with status code ".concat(e.response.status)
            : "Request failed";
        var requestInfo = !!((_e = e.request) === null || _e === void 0 ? void 0 : _e.responseURL) && !!((_f = e.config) === null || _f === void 0 ? void 0 : _f.method)
            ? "\nRequest: ".concat(e.config.method.toUpperCase(), " ").concat(e.request.responseURL)
            : '';
        return new Error("".concat(summary).concat(requestInfo));
    }
    // Handle cases where a validation error is thrown.
    // These are arrays containing `APIError` objects; no additional request context
    // is included so we only have the validation error messages themselves to work with.
    if (isValidationError(e)) {
        // Validation errors do not contain any additional context (request URL, payload, etc.).
        // Show the validation error messages instead.
        var multipleErrors = e.length > 1;
        var summary = multipleErrors
            ? 'Request failed with Linode schema validation errors'
            : 'Request failed with Linode schema validation error';
        // Format, accounting for 0, 1, or more errors.
        var validationErrorMessage = multipleErrors
            ? e
                .map(function (error) {
                return error.field
                    ? "- ".concat(error.reason, " (field '").concat(error.field, "')")
                    : "- ".concat(error.reason);
            })
                .join('\n')
            : e
                .map(function (error) {
                return error.field
                    ? "".concat(error.reason, " (field '").concat(error.field, "')")
                    : "".concat(error.reason);
            })
                .join('\n');
        return new Error("".concat(summary, "\n").concat(validationErrorMessage));
    }
    // Return `e` unmodified if it's not handled by any of the above cases.
    return e;
};
/**
 * Yields a Cypress Promise that can be used in place of a native Promise.
 *
 * @param promise - Promise with result to await.
 * @param options - Defer options.
 *
 * @returns Promise result.
 */
Cypress.Commands.add('defer', { prevSubject: false }, function (promiseGenerator, labelOrOptions) {
    // Gets the label that will used as the description for Cypress's log.
    var commandLabel = (function () {
        var _a;
        if (typeof labelOrOptions === 'string') {
            return labelOrOptions;
        }
        return (_a = labelOrOptions === null || labelOrOptions === void 0 ? void 0 : labelOrOptions.label) !== null && _a !== void 0 ? _a : 'waiting for promise';
    })();
    // Gets the options object that will be passed to `cy.wrap`.
    var wrapOptions = (function () {
        if (typeof labelOrOptions !== 'string') {
            return __assign(__assign({}, (labelOrOptions !== null && labelOrOptions !== void 0 ? labelOrOptions : {})), { log: false });
        }
        return { log: false };
    })();
    var timeoutLength = (function () {
        var _a;
        if (typeof labelOrOptions !== 'string') {
            return (_a = labelOrOptions === null || labelOrOptions === void 0 ? void 0 : labelOrOptions.timeout) !== null && _a !== void 0 ? _a : linodes_1.LINODE_CREATE_TIMEOUT;
        }
        return linodes_1.LINODE_CREATE_TIMEOUT;
    })();
    var commandLog = Cypress.log({
        autoEnd: false,
        end: false,
        message: commandLabel,
        name: 'defer',
        timeout: timeoutLength,
    });
    // Wraps the given promise in order to update Cypress's log on completion.
    var wrapPromise = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 5]);
                    return [4 /*yield*/, promiseGenerator()];
                case 1:
                    result = _b.sent();
                    return [3 /*break*/, 5];
                case 2:
                    e_1 = _b.sent();
                    commandLog.error(e_1);
                    if (!(isAxiosError(e_1) && ((_a = e_1.response) === null || _a === void 0 ? void 0 : _a.status) === 429)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, backoff_1.timeout)(15000)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: throw enhanceError(e_1);
                case 5:
                    commandLog.end();
                    return [2 /*return*/, result];
            }
        });
    }); };
    return cy.wrap(wrapPromise(), wrapOptions);
});
