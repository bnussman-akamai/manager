"use strict";
/**
 * @file Cypress intercepts and mocks for Cloud Manager Linode operations.
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
exports.interceptCancelLinodeBackups = exports.mockGetLinodeIPAddresses = exports.mockGetLinodeFirewalls = exports.interceptLinodeResize = exports.mockGetLinodeKernel = exports.mockGetLinodeKernels = exports.mockMigrateLinode = exports.interceptMigrateLinode = exports.interceptCreateLinodeSnapshot = exports.mockEnableLinodeBackups = exports.interceptEnableLinodeBackups = exports.mockCloneLinode = exports.interceptCloneLinode = exports.mockGetLinodeType = exports.mockGetLinodeTypes = exports.interceptDeleteLinode = exports.mockDeleteLinodes = exports.interceptResizeDisks = exports.interceptAddDisks = exports.interceptDeleteDisks = exports.mockGetLinodeDisks = exports.interceptGetLinodeDisks = exports.mockRebootLinodeIntoRescueModeError = exports.interceptRebootLinodeIntoRescueMode = exports.interceptRebootLinode = exports.mockRebuildLinodeError = exports.interceptRebuildLinode = exports.mockGetLinodeVolumes = exports.mockGetLinodeDetails = exports.interceptGetLinodeDetails = exports.mockGetLinodes = exports.interceptGetLinodes = exports.interceptGetLinode = exports.mockCreateLinodeError = exports.mockCreateLinode = exports.mockCreateLinodeAccountLimitError = exports.interceptCreateLinode = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var linodes_1 = require("support/util/linodes");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
/**
 * Intercepts POST request to create a Linode.
 *
 * The outgoing request payload is modified to create a Linode without access
 * to the internet.
 *
 * @returns Cypress chainable.
 */
var interceptCreateLinode = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('linode/instances'), function (req) {
        req.body = __assign(__assign({}, req.body), { interfaces: linodes_1.linodeVlanNoInternetConfig });
    });
};
exports.interceptCreateLinode = interceptCreateLinode;
/** Intercepts POST request to create a Linode and mocks an error response.
 *
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
var mockCreateLinodeAccountLimitError = function (errorMessage, statusCode) {
    if (statusCode === void 0) { statusCode = 400; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('linode/instances'), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockCreateLinodeAccountLimitError = mockCreateLinodeAccountLimitError;
/**
 * Intercepts POST request to create a Linode.
 *
 * @param linode - a mock linode object
 *
 * @returns Cypress chainable.
 */
var mockCreateLinode = function (linode) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('linode/instances'), (0, response_1.makeResponse)(linode));
};
exports.mockCreateLinode = mockCreateLinode;
/** Intercepts POST request to create a Linode and mocks an error response.
 *
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
var mockCreateLinodeError = function (errorMessage, statusCode) {
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('linode/instances'), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockCreateLinodeError = mockCreateLinodeError;
/* Intercepts GET request to get a Linode.
 *
 * @param linodeId - ID of Linode to fetch.
 *
 * @returns Cypress chainable.
 */
var interceptGetLinode = function (linodeId) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId)));
};
exports.interceptGetLinode = interceptGetLinode;
/**
 * Intercepts GET request to get all Linodes.
 *
 * @returns Cypress chainable.
 */
var interceptGetLinodes = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('linode/instances/*'));
};
exports.interceptGetLinodes = interceptGetLinodes;
/**
 * Intercepts GET request to get all Linodes and mocks the response.
 *
 * @param linodes - an array of mock linode objects
 *
 * @returns Cypress chainable.
 */
var mockGetLinodes = function (linodes) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('linode/instances/**'), (0, paginate_1.paginateResponse)(linodes));
};
exports.mockGetLinodes = mockGetLinodes;
/**
 * Intercepts GET request to retrieve Linode details.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptGetLinodeDetails = function (linodeId) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "*")));
};
exports.interceptGetLinodeDetails = interceptGetLinodeDetails;
/**
 * Intercepts GET request to retrieve Linode details and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param linode - Linode data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetLinodeDetails = function (linodeId, linode) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "*")), linode);
};
exports.mockGetLinodeDetails = mockGetLinodeDetails;
/**
 * Intercepts GET request to retrieve a Linode's Volumes and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param volumes - Array of Volumes with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetLinodeVolumes = function (linodeId, volumes) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/volumes*")), (0, paginate_1.paginateResponse)(volumes));
};
exports.mockGetLinodeVolumes = mockGetLinodeVolumes;
/**
 * Intercepts POST request to rebuild a Linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptRebuildLinode = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/rebuild")));
};
exports.interceptRebuildLinode = interceptRebuildLinode;
/**
 * Intercepts POST request to rebuild a Linode and mocks an error response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
var mockRebuildLinodeError = function (linodeId, errorMessage, statusCode) {
    if (statusCode === void 0) { statusCode = 400; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/rebuild")), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockRebuildLinodeError = mockRebuildLinodeError;
/**
 * Intercepts POST request to reboot a Linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptRebootLinode = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/reboot")));
};
exports.interceptRebootLinode = interceptRebootLinode;
/**
 * Intercepts POST request to reboot a Linode into rescue mode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptRebootLinodeIntoRescueMode = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/rescue")));
};
exports.interceptRebootLinodeIntoRescueMode = interceptRebootLinodeIntoRescueMode;
/**
 * Intercepts POST request to reboot a Linode into rescue mode and mocks error response.
 *
 * @param linodeId - ID of Linode to reboot into rescue mode.
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
var mockRebootLinodeIntoRescueModeError = function (linodeId, errorMessage, statusCode) {
    if (statusCode === void 0) { statusCode = 400; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/rescue")), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockRebootLinodeIntoRescueModeError = mockRebootLinodeIntoRescueModeError;
/**
 * Intercepts GET request to retrieve a Linode's Disks
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptGetLinodeDisks = function (linodeId) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/disks*")));
};
exports.interceptGetLinodeDisks = interceptGetLinodeDisks;
/**
 * Intercepts GET request to retrieve a Linode's Disks and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param disks - Array of Disks with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetLinodeDisks = function (linodeId, disks) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/disks*")), (0, paginate_1.paginateResponse)(disks));
};
exports.mockGetLinodeDisks = mockGetLinodeDisks;
/**
 * Intercepts DELETE request to delete a Linode's Disks
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptDeleteDisks = function (linodeId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/disks/*")));
};
exports.interceptDeleteDisks = interceptDeleteDisks;
/**
 * Intercepts POST request to add a Linode's Disks
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptAddDisks = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/disks")));
};
exports.interceptAddDisks = interceptAddDisks;
/**
 * Intercepts POST request to resize a Linode's Disks
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptResizeDisks = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/disks/*/resize")));
};
exports.interceptResizeDisks = interceptResizeDisks;
/**
 * Intercepts DELETE request to delete linode and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var mockDeleteLinodes = function (linodeId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId)), (0, response_1.makeResponse)({}));
};
exports.mockDeleteLinodes = mockDeleteLinodes;
/**
 * Intercepts DELETE request to delete linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
var interceptDeleteLinode = function (linodeId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId)));
};
exports.interceptDeleteLinode = interceptDeleteLinode;
/**
 * Intercepts GET request to fetch Linode types and mocks the response.
 *
 * @param types - Linode types with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetLinodeTypes = function (types) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('linode/types*'), (0, paginate_1.paginateResponse)(types));
};
exports.mockGetLinodeTypes = mockGetLinodeTypes;
/**
 * Intercepts GET request to fetch a Linode type and mocks the response.
 *
 * @param type - Linode type with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetLinodeType = function (type) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/types/".concat(type.id)), (0, response_1.makeResponse)(type));
};
exports.mockGetLinodeType = mockGetLinodeType;
/**
 * Intercepts POST request to clone a Linode.
 *
 * @param linodeId - ID of Linode being cloned.
 *
 * @returns Cypress chainable.
 */
var interceptCloneLinode = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/clone")));
};
exports.interceptCloneLinode = interceptCloneLinode;
/**
 * Intercepts POST request to clone a Linode and mock responses.
 *
 * @param linodeId - ID of Linode being cloned.
 *
 * @returns Cypress chainable.
 */
var mockCloneLinode = function (linodeId, linode) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/clone")), (0, response_1.makeResponse)(linode));
};
exports.mockCloneLinode = mockCloneLinode;
/**
 * Intercepts POST request to enable backups for a Linode.
 *
 * @param linodeId - ID of Linode for which to enable backups.
 *
 * @returns Cypress chainable.
 */
var interceptEnableLinodeBackups = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/backups/enable")));
};
exports.interceptEnableLinodeBackups = interceptEnableLinodeBackups;
/**
 * Intercepts POST request to enable backups for a Linode and mocks response.
 *
 * @param linodeId - ID of Linode for which to enable backups.
 *
 * @returns Cypress chainable.
 */
var mockEnableLinodeBackups = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/backups/enable")), {});
};
exports.mockEnableLinodeBackups = mockEnableLinodeBackups;
/**
 * Intercepts POST request to create a Linode snapshot.
 *
 * @param linodeId - ID of Linode for which to create snapshot.
 *
 * @returns Cypress chainable.
 */
var interceptCreateLinodeSnapshot = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/backups")));
};
exports.interceptCreateLinodeSnapshot = interceptCreateLinodeSnapshot;
/**
 * Intercepts POST request to migrate a Linode.
 *
 * @param linodeId - ID of Linode being migrated.
 *
 * @returns Cypress chainable.
 */
var interceptMigrateLinode = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/migrate")));
};
exports.interceptMigrateLinode = interceptMigrateLinode;
/**
 * Intercepts POST request to migrate a Linode.
 *
 * @param linodeId - Linode ID for which to mock migration.
 *
 * @returns Cypress chainable.
 */
var mockMigrateLinode = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/migrate")), {});
};
exports.mockMigrateLinode = mockMigrateLinode;
/**
 * Intercepts GET request to fetch Linode kernels and mocks response.
 *
 * @param mockKernels - Array of Kernel objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetLinodeKernels = function (mockKernels) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('linode/kernels*'), (0, paginate_1.paginateResponse)(mockKernels));
};
exports.mockGetLinodeKernels = mockGetLinodeKernels;
/**
 * Intercepts GET request to fetch a Linode kernel and mocks response.
 *
 * @param kernelId - ID of Kernel for which to mock response.
 * @param mockKernel - Kernel object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetLinodeKernel = function (kernelId, mockKernel) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/kernels/".concat(kernelId)), (0, response_1.makeResponse)(mockKernel));
};
exports.mockGetLinodeKernel = mockGetLinodeKernel;
/**
 * Intercepts POST request to get a Linode Resize.
 *
 * @param linodeId - ID of Linode to fetch.
 *
 * @returns Cypress chainable.
 */
var interceptLinodeResize = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/resize")));
};
exports.interceptLinodeResize = interceptLinodeResize;
/**
 * Mocks GET request to get a Linode's firewalls.
 *
 * @param linodeId - ID of Linode to get firewalls associated with it.
 * @param firewalls - the firewalls with which to mock the response.
 *
 * @returns Cypress Chainable.
 */
var mockGetLinodeFirewalls = function (linodeId, firewalls) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/firewalls")), (0, paginate_1.paginateResponse)(firewalls));
};
exports.mockGetLinodeFirewalls = mockGetLinodeFirewalls;
/**
 * Mocks GET request to get a Linode's IP addresses.
 *
 * @param linodeId - ID of Linode to get IP addresses for.
 * @param ipAddresses: the IP Addresses with which to mock the response.
 *
 * @returns Cypress Chainable.
 */
var mockGetLinodeIPAddresses = function (linodeId, ipAddresses) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/ips")), (0, response_1.makeResponse)(ipAddresses));
};
exports.mockGetLinodeIPAddresses = mockGetLinodeIPAddresses;
/**
 * Intercepts POST request to cancel backups for a Linode.
 *
 * @param linodeId - ID of Linode for which to enable backups.
 *
 * @returns Cypress chainable.
 */
var interceptCancelLinodeBackups = function (linodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("linode/instances/".concat(linodeId, "/backups/cancel")));
};
exports.interceptCancelLinodeBackups = interceptCancelLinodeBackups;
