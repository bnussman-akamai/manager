"use strict";
/**
 * @file Utility functions to easily create HTTP response objects for Cypress tests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeResponse = void 0;
/**
 * Creates an HTTP response object with the given body data.
 *
 * @param body - Response body data. Default is `{}`.
 * @param statusCode - Response HTTP status. Default is `200`.
 *
 * @returns HTTP response object.
 */
var makeResponse = function (body, statusCode) {
    if (body === void 0) { body = {}; }
    if (statusCode === void 0) { statusCode = 200; }
    return {
        body: body,
        statusCode: statusCode,
    };
};
exports.makeResponse = makeResponse;
