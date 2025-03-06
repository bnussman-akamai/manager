"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockGetTemplate = exports.mockAddFirewallDevice = exports.interceptUpdateFirewallLinodes = exports.interceptUpdateFirewallRules = exports.interceptCreateFirewall = exports.mockCreateFirewallError = exports.mockCreateFirewall = exports.mockGetFirewalls = exports.interceptGetFirewalls = void 0;
/**
 * @file Cypress intercepts and mocks for Firewall API requests.
 */
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
/**
 * Intercepts GET request to fetch Firewalls.
 *
 * @returns Cypress chainable.
 */
var interceptGetFirewalls = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('networking/firewalls*'));
};
exports.interceptGetFirewalls = interceptGetFirewalls;
/**
 * Intercepts GET request to fetch Firewalls and mocks response.
 *
 * @param firewalls - Array of Firewalls with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetFirewalls = function (firewalls) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('networking/firewalls*'), (0, paginate_1.paginateResponse)(firewalls));
};
exports.mockGetFirewalls = mockGetFirewalls;
/**
 * Intercepts POST request to create a Firewall and mocks response.
 *
 * @param firewall - A Firewall with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateFirewall = function (firewall) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('networking/firewalls*'), firewall);
};
exports.mockCreateFirewall = mockCreateFirewall;
/**
 * Intercepts POST request to create a Firewall and mocks an error response.
 *
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
var mockCreateFirewallError = function (errorMessage, statusCode) {
    if (statusCode === void 0) { statusCode = 400; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("networking/firewalls*"), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockCreateFirewallError = mockCreateFirewallError;
/**
 * Intercepts POST request to create a Firewall.
 *
 * @returns Cypress chainable.
 */
var interceptCreateFirewall = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('networking/firewalls'));
};
exports.interceptCreateFirewall = interceptCreateFirewall;
/**
 * Intercepts PUT request to update a Firewall's rules.
 *
 * @returns Cypress chainable.
 */
var interceptUpdateFirewallRules = function (firewallId) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("networking/firewalls/".concat(firewallId, "/rules")));
};
exports.interceptUpdateFirewallRules = interceptUpdateFirewallRules;
/**
 * Intercepts POST request to update a Firewall's Linodes.
 *
 * @returns Cypress chainable.
 */
var interceptUpdateFirewallLinodes = function (firewallId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("networking/firewalls/".concat(firewallId, "/devices")));
};
exports.interceptUpdateFirewallLinodes = interceptUpdateFirewallLinodes;
/**
 * Mocks the POST request to add a Firewall device.
 *
 * @returns Cypress chainable.
 */
var mockAddFirewallDevice = function (firewallId, firewallDevice) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("networking/firewalls/".concat(firewallId, "/devices")), firewallDevice);
};
exports.mockAddFirewallDevice = mockAddFirewallDevice;
/**
 * Intercepts GET request to fetch a Firewall template and mocks response.
 *
 * @param template - Template with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetTemplate = function (template) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('networking/firewalls/templates/*'), template);
};
exports.mockGetTemplate = mockGetTemplate;
