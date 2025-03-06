"use strict";
/**
 * @files Cypress intercepts and mocks for Volume API requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockGetVolumeTypesError = exports.mockGetVolumeTypes = exports.mockMigrateVolumes = exports.interceptDeleteVolume = exports.interceptResizeVolume = exports.interceptCloneVolume = exports.mockDetachVolume = exports.interceptDetachVolume = exports.interceptAttachVolume = exports.mockCreateVolume = exports.interceptCreateVolume = exports.mockGetVolume = exports.mockGetVolumes = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
/**
 * Intercepts GET request to fetch Volumes and mocks response.
 *
 * @param volumes - Array of Volumes with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetVolumes = function (volumes) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('volumes*'), (0, paginate_1.paginateResponse)(volumes));
};
exports.mockGetVolumes = mockGetVolumes;
/**
 * Intercepts GET request to fetch a Volume and mocks response.
 *
 * @param volume - Volume with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetVolume = function (volume) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("volumes/".concat(volume.id)), (0, response_1.makeResponse)(volume));
};
exports.mockGetVolume = mockGetVolume;
/**
 * Intercepts POST request to create a Volume.
 *
 * @returns Cypress chainable.
 */
var interceptCreateVolume = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('volumes'));
};
exports.interceptCreateVolume = interceptCreateVolume;
/**
 * Intercepts POST request to create a Volume and mocks response.
 *
 * @param volume - Volume with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateVolume = function (volume) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('volumes'), volume);
};
exports.mockCreateVolume = mockCreateVolume;
/**
 * Intercepts POST request to attach a Volume to a Linode.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptAttachVolume = function (volumeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("volumes/".concat(volumeId, "/attach")));
};
exports.interceptAttachVolume = interceptAttachVolume;
/**
 * Intercepts POST request to detach a Volume from a Linode.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptDetachVolume = function (volumeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("volumes/".concat(volumeId, "/detach")));
};
exports.interceptDetachVolume = interceptDetachVolume;
/**
 * Intercepts POST request to detach a Volume from a Linode and mocks response.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
var mockDetachVolume = function (volumeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("volumes/".concat(volumeId, "/detach")), {});
};
exports.mockDetachVolume = mockDetachVolume;
/**
 * Intercepts a POST request to clone a Volume.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptCloneVolume = function (volumeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("volumes/".concat(volumeId, "/clone")));
};
exports.interceptCloneVolume = interceptCloneVolume;
/**
 * Intercepts POST request to resize a Volume.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptResizeVolume = function (volumeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("volumes/".concat(volumeId, "/resize")));
};
exports.interceptResizeVolume = interceptResizeVolume;
/**
 * Intercepts POST request to delete a Volume.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptDeleteVolume = function (volumeId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("volumes/".concat(volumeId)));
};
exports.interceptDeleteVolume = interceptDeleteVolume;
/**
 * Intercepts POST request to migrate volumes and mocks response.
 *
 * @returns Cypress chainable.
 */
var mockMigrateVolumes = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("volumes/migrate"), {});
};
exports.mockMigrateVolumes = mockMigrateVolumes;
/**
 * Intercepts GET request to fetch Volumes Types and mocks response.
 *
 * @returns Cypress chainable.
 */
var mockGetVolumeTypes = function (volumeTypes) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('volumes/types*'), (0, paginate_1.paginateResponse)(volumeTypes));
};
exports.mockGetVolumeTypes = mockGetVolumeTypes;
/**
 * Intercepts GET request to fetch Volumes Types and mocks an error response.
 *
 * @returns Cypress chainable.
 */
var mockGetVolumeTypesError = function () {
    var errorResponse = (0, errors_1.makeErrorResponse)('', 500);
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('volumes/types*'), (0, response_1.makeResponse)(errorResponse));
};
exports.mockGetVolumeTypesError = mockGetVolumeTypesError;
