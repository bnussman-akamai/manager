"use strict";
/**
 * @file Utility functions to easily create errors and error responses for API mocking.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeErrorResponse = exports.makeError = void 0;
var response_1 = require("./response");
/**
 * Creates an API error object that describes one or more errors.
 *
 * @param error - String or array of strings describing errors.
 *
 * @returns API error object containing the given error or errors.
 */
var makeError = function (error) {
    var errorArray = Array.isArray(error) ? error : [error];
    return {
        errors: errorArray.map(function (errorString) {
            return {
                reason: errorString,
            };
        }),
    };
};
exports.makeError = makeError;
/**
 * Creates an API error response that describes one or more errors.
 *
 * @param error - String or array of strings describing errors.
 * @param statusCode - HTTP status code for created response. Default `400`.
 *
 * @returns HTTP response object containing the given error or errors.
 */
var makeErrorResponse = function (error, statusCode) {
    if (statusCode === void 0) { statusCode = 400; }
    return (0, response_1.makeResponse)((0, exports.makeError)(error), statusCode);
};
exports.makeErrorResponse = makeErrorResponse;
