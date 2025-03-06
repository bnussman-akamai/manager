"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockApiRequestWithError = exports.mockApiMaintenanceMode = exports.mockWebpageUrl = exports.mockAllApiRequests = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var response_1 = require("support/util/response");
/**
 * Intercepts all requests to Linode API v4 and mocks an HTTP response.
 *
 * This is useful to apply a baseline mock on all Linode API v4 requests, e.g.
 * to prevent 401 responses. More fine-grained mocking can be set up with
 * subsequent calls to other mock utils.
 *
 * @param body - Body data with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockAllApiRequests = function (body, statusCode) {
    if (body === void 0) { body = {}; }
    if (statusCode === void 0) { statusCode = 200; }
    return cy.intercept((0, intercepts_1.apiMatcher)('**/*'), (0, response_1.makeResponse)(body, statusCode));
};
exports.mockAllApiRequests = mockAllApiRequests;
/**
 * Intercepts GET request to given URL and mocks an HTTP 200 response with the given content.
 *
 * This can be used to mock visits to arbitrary webpages.
 *
 * @param url - Webpage URL for which to intercept GET request.
 * @param content - Webpage content with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockWebpageUrl = function (url, content) {
    return cy.intercept(url, (0, response_1.makeResponse)(content, 200));
};
exports.mockWebpageUrl = mockWebpageUrl;
/**
 * Intercepts all Linode APIv4 requests and mocks maintenance mode response.
 *
 * Maintenance mode mock is achieved by inserting the `x-maintenace-mode` header
 * into the intercepted response.
 *
 * @returns Cypress chainable.
 */
var mockApiMaintenanceMode = function () {
    var errorResponse = (0, errors_1.makeErrorResponse)('Currently in maintenance mode.', 503);
    errorResponse.headers = {
        'x-maintenance-mode': 'all,All endpoints are temporarily unavailable.',
    };
    return cy.intercept((0, intercepts_1.apiMatcher)('**'), errorResponse);
};
exports.mockApiMaintenanceMode = mockApiMaintenanceMode;
/**
 * Intercepts all requests to Linode API v4 and mocks an error HTTP response.
 *
 * @param errorCode - HTTP status code to mock.
 * @param errorMessage - Response error message to mock.
 *
 * @returns Cypress chainable.
 */
var mockApiRequestWithError = function (errorCode, errorReason) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('*'), {
        statusCode: errorCode,
        body: {
            errors: [
                {
                    reason: errorReason,
                },
            ],
        },
    });
};
exports.mockApiRequestWithError = mockApiRequestWithError;
