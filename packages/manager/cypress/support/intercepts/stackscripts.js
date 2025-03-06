"use strict";
/**
 * @file Cypress intercepts and mocks for Cloud Manager StackScript operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUpdateStackScriptError = exports.mockUpdateStackScript = exports.mockDeleteStackScript = exports.interceptCreateStackScript = exports.mockGetStackScript = exports.mockGetStackScripts = exports.interceptGetStackScript = exports.interceptGetStackScripts = void 0;
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
/**
 * Intercepts GET request to list StackScripts.
 *
 * @returns Cypress chainable.
 */
var interceptGetStackScripts = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('linode/stackscripts*'));
};
exports.interceptGetStackScripts = interceptGetStackScripts;
/**
 * Intercepts GET request to a StackScript.
 *
 * @returns Cypress chainable.
 */
var interceptGetStackScript = function (id) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/stackscripts/".concat(id)));
};
exports.interceptGetStackScript = interceptGetStackScript;
/**
 * Intercepts GET request to mock StackScript data.
 *
 * @param stackScripts - an array of mock StackScript objects
 *
 * @returns Cypress chainable.
 */
var mockGetStackScripts = function (stackScripts) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('linode/stackscripts*'), (0, paginate_1.paginateResponse)(stackScripts));
};
exports.mockGetStackScripts = mockGetStackScripts;
/**
 * Intercepts GET request to mock a StackScript.
 *
 * @param id - StackScript instance identifier
 * @param stackscript - a mock StackScript object
 *
 * @returns Cypress chainable.
 */
var mockGetStackScript = function (id, stackscript) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/stackscripts/".concat(id)), stackscript);
};
exports.mockGetStackScript = mockGetStackScript;
/**
 * Intercepts POST request to create a StackScript.
 *
 * @returns Cypress chainable.
 */
var interceptCreateStackScript = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('linode/stackscripts'));
};
exports.interceptCreateStackScript = interceptCreateStackScript;
/**
 * Mock DELETE request to remove a StackScript.
 *
 * @returns Cypress chainable.
 */
var mockDeleteStackScript = function (id) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("linode/stackscripts/".concat(id)), {
        body: {},
        statusCode: 200,
    });
};
exports.mockDeleteStackScript = mockDeleteStackScript;
/**
 * Intercept PUT request to update a StackScript.
 *
 * @param id - StackScript instance identifier
 * @param stackscript - a mock StackScript object
 *
 * @returns Cypress chainable.
 */
var mockUpdateStackScript = function (id, stackscript) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("linode/stackscripts/".concat(id)), (0, response_1.makeResponse)(stackscript));
};
exports.mockUpdateStackScript = mockUpdateStackScript;
/**
 * Intercept PUT request to mock StackScript update error.
 *
 * @param id - StackScript instance identifier
 * @param err_message - the error message if is_err is true
 *
 * @returns Cypress chainable.
 */
var mockUpdateStackScriptError = function (id, err_field, err_message) {
    if (err_field === void 0) { err_field = null; }
    if (err_message === void 0) { err_message = null; }
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("linode/stackscripts/".concat(id)), (0, response_1.makeResponse)({
        errors: [
            {
                field: err_field,
                reason: err_message,
            },
        ],
    }, 400));
};
exports.mockUpdateStackScriptError = mockUpdateStackScriptError;
