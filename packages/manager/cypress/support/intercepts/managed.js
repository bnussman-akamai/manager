"use strict";
/**
 * @file Cypress intercepts and mocks for Linode Managed operations.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUpdateLinodeSettings = exports.mockGetLinodeSettings = exports.mockGetSshPublicKey = exports.mockGetStats = exports.mockDeleteContact = exports.mockUpdateContact = exports.mockCreateContact = exports.mockGetContacts = exports.mockDeleteCredential = exports.mockUpdateCredentialUsernamePassword = exports.mockUpdateCredential = exports.mockCreateCredential = exports.mockGetCredentials = exports.mockGetIssues = exports.mockEnableServiceMonitor = exports.mockDisableServiceMonitor = exports.mockUpdateServiceMonitor = exports.mockDeleteServiceMonitor = exports.mockCreateServiceMonitor = exports.mockGetServiceMonitors = exports.mockUnauthorizedManagedRequests = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
var managed_1 = require("src/factories/managed");
/**
 * Intercepts all requests to Managed endpoints and mocks 403 HTTP errors.
 */
var mockUnauthorizedManagedRequests = function () {
    return cy.intercept((0, intercepts_1.apiMatcher)('managed/*'), (0, errors_1.makeErrorResponse)('Unauthorized', 403));
};
exports.mockUnauthorizedManagedRequests = mockUnauthorizedManagedRequests;
/**
 * Intercepts GET requests to fetch Managed service monitors and mocks response.
 *
 * @param serviceMonitors - Service monitors with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetServiceMonitors = function (serviceMonitors) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('managed/services*'), (0, paginate_1.paginateResponse)(serviceMonitors));
};
exports.mockGetServiceMonitors = mockGetServiceMonitors;
/**
 * Intercepts POST requests to create a Managed service monitor and mocks response.
 *
 * @param serviceMonitor - Service monitor payload with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateServiceMonitor = function (serviceMonitor) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('managed/services'), (0, response_1.makeResponse)(serviceMonitor));
};
exports.mockCreateServiceMonitor = mockCreateServiceMonitor;
/**
 * Intercepts DELETE request to delete a Managed service monitor and mocks response.
 *
 * @param serviceId - ID of service monitor whose DELETE request should be mocked.
 *
 * @returns Cypress chainable.
 */
var mockDeleteServiceMonitor = function (serviceId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("managed/services/".concat(serviceId)), {});
};
exports.mockDeleteServiceMonitor = mockDeleteServiceMonitor;
/**
 * Intercepts PUT requests to update Managed service monitors and mocks response.
 *
 * @param serviceId - ID of the monitor whose update request should be mocked.
 * @param serviceMonitor - Service monitor payload with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateServiceMonitor = function (serviceId, serviceMonitor) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("managed/services/".concat(serviceId)), (0, response_1.makeResponse)(serviceMonitor));
};
exports.mockUpdateServiceMonitor = mockUpdateServiceMonitor;
/**
 * Intercepts POST request to disable a Managed service monitor and mocks response.
 *
 * @param serviceId - ID of the monitor whose disable request should be mocked.
 * @param serviceMonitor - Service monitor payload with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockDisableServiceMonitor = function (serviceId, serviceMonitor) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("managed/services/".concat(serviceId, "/disable")), (0, response_1.makeResponse)(__assign(__assign({}, serviceMonitor), { status: 'disabled' })));
};
exports.mockDisableServiceMonitor = mockDisableServiceMonitor;
/**
 * Intercepts POST request to enable a Managed service monitor and mocks response.
 *
 * @param serviceId - ID of the monitor whose enable request should be mocked.
 * @param serviceMonitor - Service monitor payload with which to mock response.
 * @param serviceMonitorStatus - Optional status for monitor after being enabled; default is `'ok'`.
 *
 * @returns Cypress chainable.
 */
var mockEnableServiceMonitor = function (serviceId, serviceMonitor, serviceMonitorStatus) {
    if (serviceMonitorStatus === void 0) { serviceMonitorStatus = 'ok'; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("managed/services/".concat(serviceId, "/enable")), (0, response_1.makeResponse)(__assign(__assign({}, serviceMonitor), { status: serviceMonitorStatus })));
};
exports.mockEnableServiceMonitor = mockEnableServiceMonitor;
/**
 * Intercepts GET request to fetch Managed issues and mocks response.
 *
 * @param issues - Issues with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetIssues = function (issues) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('managed/issues*'), (0, paginate_1.paginateResponse)(issues));
};
exports.mockGetIssues = mockGetIssues;
/**
 * Intercepts GET request to fetch Managed credentials and mocks response.
 *
 * @param credentials - Credentials with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetCredentials = function (credentials) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('managed/credentials*'), (0, paginate_1.paginateResponse)(credentials));
};
exports.mockGetCredentials = mockGetCredentials;
/**
 * Intercepts POST request to create a Managed credential and mocks response.
 *
 * @param credential - Credential mock with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockCreateCredential = function (credential) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('managed/credentials'), (0, response_1.makeResponse)(credential));
};
exports.mockCreateCredential = mockCreateCredential;
/**
 * Intercepts PUT request to update a Managed credential and mocks response.
 *
 * @param id - ID of credential being updated.
 * @param credential - Credential mock with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockUpdateCredential = function (id, credential) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("managed/credentials/".concat(id)), (0, response_1.makeResponse)(credential));
};
exports.mockUpdateCredential = mockUpdateCredential;
/**
 * Intercepts POST request to update a Managed credential username/password pair and mocks response.
 *
 * @param id - ID of credential being updated.
 *
 * @returns Cypress chainable.
 */
var mockUpdateCredentialUsernamePassword = function (id) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("managed/credentials/".concat(id, "/update")), (0, response_1.makeResponse)({}));
};
exports.mockUpdateCredentialUsernamePassword = mockUpdateCredentialUsernamePassword;
/**
 * Intercepts POST request to delete a Managed credential and mocks response.
 *
 * @param id - ID of the credential whose deletion is being mocked.
 *
 * @returns Cypress chainable.
 */
var mockDeleteCredential = function (id) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("managed/credentials/".concat(id, "/revoke")), (0, response_1.makeResponse)({}));
};
exports.mockDeleteCredential = mockDeleteCredential;
/**
 * Intercepts GET request to fetch Managed contacts and mocks response.
 *
 * @param contacts - Contacts with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetContacts = function (contacts) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('managed/contacts*'), (0, paginate_1.paginateResponse)(contacts));
};
exports.mockGetContacts = mockGetContacts;
/**
 * Intercepts POST request to create a Managed contact and mocks response.
 *
 * @param contact - Contact mock with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockCreateContact = function (contact) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('managed/contacts'), (0, response_1.makeResponse)(contact));
};
exports.mockCreateContact = mockCreateContact;
/**
 * Intercepts PUT request to update a Managed contact and mocks response.
 *
 * @param id - ID of contact being updated.
 * @param contact - Contact mock with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockUpdateContact = function (id, contact) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("managed/contacts/".concat(id)), (0, response_1.makeResponse)(contact));
};
exports.mockUpdateContact = mockUpdateContact;
/**
 * Intercepts DELETE request to delete a Managed contact and mocks response.
 *
 * @param id - ID of contact whose deletion is being mocked.
 *
 * @returns Cypress chainable.
 */
var mockDeleteContact = function (id) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("managed/contacts/".concat(id)), (0, response_1.makeResponse)({}));
};
exports.mockDeleteContact = mockDeleteContact;
/**
 * Intercepts GET request to fetch Managed stats and mocks response.
 *
 * If no stats are provided for mocking, the default factory data will be used.
 *
 * @param stats - Stats with which to respond, or `undefined`.
 *
 * @returns Cypress chainable.
 */
var mockGetStats = function (stats) {
    var mockStats = stats ? stats : managed_1.managedStatsFactory.build();
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('managed/stats*'), mockStats);
};
exports.mockGetStats = mockGetStats;
/**
 * Intercepts GET request to fetch Managed SSH public key and mocks response.
 *
 * @param publicKey - Optional public key string to use for mocked value.
 *
 * @returns Cypress chainable.
 */
var mockGetSshPublicKey = function (publicKey) {
    var publicKeyObject = publicKey
        ? managed_1.managedSSHPubKeyFactory.build({
            ssh_key: publicKey,
        })
        : managed_1.managedSSHPubKeyFactory.build();
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('managed/credentials/sshkey'), (0, response_1.makeResponse)(publicKeyObject));
};
exports.mockGetSshPublicKey = mockGetSshPublicKey;
/**
 * Intercepts GET request to fetch Managed Linode settings and mocks response.
 *
 * @param linodeSettings - Array of Linode settings to use for mock.
 *
 * @returns Cypress chainable.
 */
var mockGetLinodeSettings = function (linodeSettings) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('managed/linode-settings*'), (0, paginate_1.paginateResponse)(linodeSettings));
};
exports.mockGetLinodeSettings = mockGetLinodeSettings;
/**
 * Intercepts PUT request to update a managed Linode's settings and mocks response.
 *
 * @param id - Linode ID whose settings update request will be mocked.
 * @param linodeSettings - Mock Linode settings with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockUpdateLinodeSettings = function (id, linodeSettings) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("managed/linode-settings/".concat(id)), (0, response_1.makeResponse)(linodeSettings));
};
exports.mockUpdateLinodeSettings = mockUpdateLinodeSettings;
