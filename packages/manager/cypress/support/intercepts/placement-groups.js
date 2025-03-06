"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUpdatePlacementGroupError = exports.mockUpdatePlacementGroup = exports.mockDeletePlacementGroupError = exports.mockUnassignPlacementGroupLinodesError = exports.mockUnassignPlacementGroupLinodes = exports.mockAssignPlacementGroupLinodesError = exports.mockAssignPlacementGroupLinodes = exports.mockDeletePlacementGroup = exports.mockCreatePlacementGroup = exports.mockGetPlacementGroup = exports.mockGetPlacementGroups = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
/**
 * Intercepts GET request to fetch Placement Groups and mocks response.
 *
 * @param placementGroups - Array of Placement Group objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetPlacementGroups = function (placementGroups) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('placement/groups*'), (0, paginate_1.paginateResponse)(placementGroups));
};
exports.mockGetPlacementGroups = mockGetPlacementGroups;
/**
 * Intercepts GET request to fetch a Placement Group and mocks response.
 *
 * @param placementGroup - Placement Group to intercept and mock.
 *
 * @returns Cypress chainable.
 */
var mockGetPlacementGroup = function (placementGroup) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("placement/groups/".concat(placementGroup.id)), (0, response_1.makeResponse)(placementGroup));
};
exports.mockGetPlacementGroup = mockGetPlacementGroup;
/**
 * Intercept POST request to create a Placement Group and mocks response.
 *
 * @param placementGroup - Placement group object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreatePlacementGroup = function (placementGroup) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('placement/groups'), (0, response_1.makeResponse)(placementGroup));
};
exports.mockCreatePlacementGroup = mockCreatePlacementGroup;
/**
 * Intercepts DELETE request to delete Placement Group and mocks response.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept delete request.
 *
 * @returns Cypress chainable.
 */
var mockDeletePlacementGroup = function (placementGroupId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("placement/groups/".concat(placementGroupId)), (0, response_1.makeResponse)({}));
};
exports.mockDeletePlacementGroup = mockDeletePlacementGroup;
/**
 * Intercepts POST request to assign Linodes to Placement Group and mocks response.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept assign request.
 * @param placementGroup - Placement Group object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockAssignPlacementGroupLinodes = function (placementGroupId, placementGroup) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("placement/groups/".concat(placementGroupId, "/assign")), (0, response_1.makeResponse)(placementGroup));
};
exports.mockAssignPlacementGroupLinodes = mockAssignPlacementGroupLinodes;
/**
 * Intercepts POST request to assign Linodes to Placement Group and mocks an HTTP error response.
 *
 * By default, a 500 response is mocked.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `500`.
 *
 * @returns Cypress chainable.
 */
var mockAssignPlacementGroupLinodesError = function (placementGroupId, errorMessage, errorCode) {
    if (errorMessage === void 0) { errorMessage = 'An error has occurred'; }
    if (errorCode === void 0) { errorCode = 500; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("placement/groups/".concat(placementGroupId, "/assign")), (0, errors_1.makeErrorResponse)(errorMessage, errorCode));
};
exports.mockAssignPlacementGroupLinodesError = mockAssignPlacementGroupLinodesError;
/**
 * Intercepts POST request to unassign Linodes from Placement Group and mocks response.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept unassign request.
 * @param placementGroup - Placement Group object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUnassignPlacementGroupLinodes = function (placementGroupId, placementGroup) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("placement/groups/".concat(placementGroupId, "/unassign")), (0, response_1.makeResponse)(placementGroup));
};
exports.mockUnassignPlacementGroupLinodes = mockUnassignPlacementGroupLinodes;
/**
 * Intercepts POST request to unassign Linodes from Placement Groups and mocks an HTTP error response.
 *
 * By default, a 500 response is mocked.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `500`.
 *
 * @returns Cypress chainable.
 */
var mockUnassignPlacementGroupLinodesError = function (placementGroupId, errorMessage, errorCode) {
    if (errorMessage === void 0) { errorMessage = 'An error has occurred'; }
    if (errorCode === void 0) { errorCode = 500; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("placement/groups/".concat(placementGroupId, "/unassign")), (0, errors_1.makeErrorResponse)(errorMessage, errorCode));
};
exports.mockUnassignPlacementGroupLinodesError = mockUnassignPlacementGroupLinodesError;
/**
 * Intercepts POST request to delete a Placement Group and mocks an HTTP error response.
 *
 * By default, a 500 response is mocked.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `500`.
 *
 * @returns Cypress chainable.
 */
var mockDeletePlacementGroupError = function (placementGroupId, errorMessage, errorCode) {
    if (errorMessage === void 0) { errorMessage = 'An error has occurred'; }
    if (errorCode === void 0) { errorCode = 500; }
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("placement/groups/".concat(placementGroupId)), (0, errors_1.makeErrorResponse)(errorMessage, errorCode));
};
exports.mockDeletePlacementGroupError = mockDeletePlacementGroupError;
/**
 * Intercepts PUT request to update Placement Group label and mocks response.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept update label request.
 * @param placementGroupData - Placement Group object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdatePlacementGroup = function (placementGroupId, placementGroupData) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("placement/groups/".concat(placementGroupId)), (0, response_1.makeResponse)(placementGroupData));
};
exports.mockUpdatePlacementGroup = mockUpdatePlacementGroup;
/**
 * Intercepts PUT request to update Placement Group label and mocks HTTP error response.
 *
 * By default, a 500 response is mocked.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept update label request.
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `500`.
 *
 * @returns Cypress chainable.
 */
var mockUpdatePlacementGroupError = function (placementGroupId, errorMessage, errorCode) {
    if (errorMessage === void 0) { errorMessage = 'An error has occurred'; }
    if (errorCode === void 0) { errorCode = 500; }
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("placement/groups/".concat(placementGroupId)), (0, errors_1.makeErrorResponse)(errorMessage, errorCode));
};
exports.mockUpdatePlacementGroupError = mockUpdatePlacementGroupError;
