"use strict";
/**
 * @file Cypress intercepts and mocks for Cloud Manager Linode operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockCreateLinodeConfigInterfaces = exports.mockCreateLinodeConfigs = exports.mockUpdateLinodeConfigs = exports.mockGetLinodeConfigs = exports.mockDeleteLinodeConfigInterface = exports.interceptDeleteLinodeConfig = exports.interceptUpdateLinodeConfigs = exports.interceptCreateLinodeConfigs = exports.interceptGetLinodeConfigs = void 0;
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
/**
 * Intercepts GET request to fetch all configs for a given linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptGetLinodeConfigs = function (linodeId) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/configs*")));
};
exports.interceptGetLinodeConfigs = interceptGetLinodeConfigs;
/**
 * Intercepts POST request to create a linode config.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptCreateLinodeConfigs = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/configs")));
};
exports.interceptCreateLinodeConfigs = interceptCreateLinodeConfigs;
/**
 * Intercepts PUT request to update a linode config.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param configId - ID of Linode config for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptUpdateLinodeConfigs = function (linodeId, configId) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/configs/").concat(configId)));
};
exports.interceptUpdateLinodeConfigs = interceptUpdateLinodeConfigs;
/**
 * Intercepts DELETE request to delete a linode config.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param configId - ID of Linode config for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptDeleteLinodeConfig = function (linodeId, configId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/configs/").concat(configId)));
};
exports.interceptDeleteLinodeConfig = interceptDeleteLinodeConfig;
/**
 * Mocks DELETE request to delete an interface of linode config.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param configId - ID of Linode config for intercepted request.
 * @param interfaceId - ID of Interface in the Linode config.
 *
 * @returns Cypress chainable.
 */
var mockDeleteLinodeConfigInterface = function (linodeId, configId, interfaceId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/configs/").concat(configId, "/interfaces/").concat(interfaceId)), (0, response_1.makeResponse)());
};
exports.mockDeleteLinodeConfigInterface = mockDeleteLinodeConfigInterface;
/**
 * Mocks GET request to retrieve Linode configs.
 *
 * @param linodeId - ID of Linode for mocked request.
 * @param configs - a list of Linode configswith which to mocked response.
 *
 * @returns Cypress chainable.
 */
var mockGetLinodeConfigs = function (linodeId, configs) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/configs*")), (0, paginate_1.paginateResponse)(configs));
};
exports.mockGetLinodeConfigs = mockGetLinodeConfigs;
/**
 * Mocks PUT request to update a linode config.
 *
 * @param linodeId - ID of Linode for mock request.
 * @param config - config data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateLinodeConfigs = function (linodeId, config) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/configs/").concat(config.id)), config);
};
exports.mockUpdateLinodeConfigs = mockUpdateLinodeConfigs;
/**
 * Mocks POST request to create a Linode config.
 *
 * @param linodeId - ID of Linode for mocked request.
 * @param config - config data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateLinodeConfigs = function (linodeId, config) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/configs")), config);
};
exports.mockCreateLinodeConfigs = mockCreateLinodeConfigs;
/**
 * Mocks POST request to retrieve interfaces from a given Linode config.
 *
 * @param linodeId - ID of Linode for mocked request.
 * @param config - config data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateLinodeConfigInterfaces = function (linodeId, config) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/configs/").concat(config.id, "/interfaces")), config.interfaces);
};
exports.mockCreateLinodeConfigInterfaces = mockCreateLinodeConfigInterfaces;
