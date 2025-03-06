"use strict";
/**
 * @file Cypress intercepts and mocks for Cloud Manager DBaaS operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockGetDatabasesError = exports.mockGetDatabaseEngines = exports.mockGetDatabaseTypes = exports.mockDeleteProvisioningDatabase = exports.mockDeleteDatabase = exports.mockResetPasswordProvisioningDatabase = exports.mockResetPassword = exports.mockUpdateProvisioningDatabase = exports.mockResizeProvisioningDatabase = exports.mockResize = exports.mockUpdateDatabase = exports.mockCreateDatabase = exports.mockGetDatabaseCredentials = exports.mockGetDatabases = exports.mockGetDatabase = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
var random_1 = require("support/util/random");
/**
 * Default message to use when performing operations on provisioning DBs.
 */
var defaultErrorMessageProvisioning = 'Your database is provisioning; please wait until provisioning is complete to perform this operation.';
/**
 * Intercepts GET request to fetch database instance and mocks response.
 *
 * @param database - Response database.
 *
 * @returns Cypress chainable.
 */
var mockGetDatabase = function (database) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("databases/".concat(database.engine, "/instances/").concat(database.id)), (0, response_1.makeResponse)(database));
};
exports.mockGetDatabase = mockGetDatabase;
/**
 * Intercepts GET request to fetch database instances and mocks response.
 *
 * @param databases - Databases with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetDatabases = function (databases) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("databases/instances*"), (0, paginate_1.paginateResponse)(databases));
};
exports.mockGetDatabases = mockGetDatabases;
/**
 * Intercepts GET request to retrieve database credentials and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine.
 * @param password - Optional response password. If not specified, a random string is returned.
 *
 * @returns Cypress chainable.
 */
var mockGetDatabaseCredentials = function (id, engine, password) {
    var username = engine === 'postgresql' ? 'linpostgres' : 'linroot';
    var responsePassword = password ||
        (0, random_1.randomString)(16, {
            lowercase: true,
            numbers: true,
            spaces: false,
            symbols: true,
            uppercase: true,
        });
    var credentials = {
        password: responsePassword,
        username: username,
    };
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("databases/".concat(engine, "/instances/").concat(id, "/credentials")), credentials);
};
exports.mockGetDatabaseCredentials = mockGetDatabaseCredentials;
/**
 * Intercepts POST request to create a database and mocks response.
 *
 * @param database - Database with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateDatabase = function (database) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("databases/".concat(database.engine, "/instances")), (0, response_1.makeResponse)(database));
};
exports.mockCreateDatabase = mockCreateDatabase;
/**
 * Intercepts PUT request to update an active database and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 *
 * @returns Cypress chainable.
 */
var mockUpdateDatabase = function (id, engine, responseData) {
    if (responseData === void 0) { responseData = {}; }
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("databases/".concat(engine, "/instances/").concat(id)), responseData);
};
exports.mockUpdateDatabase = mockUpdateDatabase;
/**
 * Intercepts POST request to reset an active database's password and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 *
 * @returns Cypress chainable.
 */
var mockResize = function (id, engine, responseData) {
    if (responseData === void 0) { responseData = {}; }
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("databases/".concat(engine, "/instances/").concat(id)), responseData);
};
exports.mockResize = mockResize;
var mockResizeProvisioningDatabase = function (id, engine, responseErrorMessage) {
    var error = (0, errors_1.makeErrorResponse)(responseErrorMessage || defaultErrorMessageProvisioning);
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("databases/".concat(engine, "/instances/").concat(id)), error);
};
exports.mockResizeProvisioningDatabase = mockResizeProvisioningDatabase;
/**
 * Intercepts PUT request to update a provisioning database and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 * @param responseErrorMessage - Optional error message for mocked response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateProvisioningDatabase = function (id, engine, responseErrorMessage) {
    var error = (0, errors_1.makeErrorResponse)(responseErrorMessage || defaultErrorMessageProvisioning);
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("databases/".concat(engine, "/instances/").concat(id)), error);
};
exports.mockUpdateProvisioningDatabase = mockUpdateProvisioningDatabase;
/**
 * Intercepts POST request to reset an active database's password and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 *
 * @returns Cypress chainable.
 */
var mockResetPassword = function (id, engine) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("databases/".concat(engine, "/instances/").concat(id, "/credentials/reset")), {});
};
exports.mockResetPassword = mockResetPassword;
/**
 * Intercepts POST request to reset a provisioning database's password and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 * @param responseErrorMessage - Optional error message for mocked response.
 *
 * @returns Cypress chainable.
 */
var mockResetPasswordProvisioningDatabase = function (id, engine, responseErrorMessage) {
    var error = (0, errors_1.makeErrorResponse)(responseErrorMessage || defaultErrorMessageProvisioning);
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("databases/".concat(engine, "/instances/").concat(id, "/credentials/reset")), error);
};
exports.mockResetPasswordProvisioningDatabase = mockResetPasswordProvisioningDatabase;
/**
 * Intercepts DELETE request to delete a database and mocks 200 response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 *
 * @returns Cypress chainable.
 */
var mockDeleteDatabase = function (id, engine) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("databases/".concat(engine, "/instances/").concat(id)), {});
};
exports.mockDeleteDatabase = mockDeleteDatabase;
/**
 * Intercepts DELETE request to delete a provisioning database and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 * @param responseErrorMessage - Optional error message for mocked response.
 *
 * @returns Cypress chainable.
 */
var mockDeleteProvisioningDatabase = function (id, engine, responseErrorMessage) {
    var error = (0, errors_1.makeErrorResponse)(responseErrorMessage || defaultErrorMessageProvisioning);
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("databases/".concat(engine, "/instances/").concat(id)), error);
};
exports.mockDeleteProvisioningDatabase = mockDeleteProvisioningDatabase;
/**
 * Intercepts GET request to fetch DBaaS node types and mocks response.
 *
 * @param databaseTypes - Database node types.
 *
 * @returns Cypress chainable.
 */
var mockGetDatabaseTypes = function (databaseTypes) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('databases/types*'), (0, paginate_1.paginateResponse)(databaseTypes));
};
exports.mockGetDatabaseTypes = mockGetDatabaseTypes;
/**
 * Intercepts GET request to fetch available DBaaS engines and mocks response.
 *
 * @param engines - Database engine types.
 *
 * @returns Cypress chainable.
 */
var mockGetDatabaseEngines = function (engines) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('databases/engines*'), (0, paginate_1.paginateResponse)(engines));
};
exports.mockGetDatabaseEngines = mockGetDatabaseEngines;
/**
 * Mocks an error response for the GET request to retrieve database instances in CloudPulse.
 *
 * This function intercepts the 'GET' request made to the CloudPulse API endpoint for retrieving database instances
 * and simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
var mockGetDatabasesError = function (errorMessage, status) {
    if (status === void 0) { status = 500; }
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('databases/instances*'), (0, errors_1.makeErrorResponse)(errorMessage, status));
};
exports.mockGetDatabasesError = mockGetDatabasesError;
