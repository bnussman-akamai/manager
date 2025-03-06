"use strict";
/**
 * @file Cypress intercepts and mocks for Domain API requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockGetDomainZoneFile = exports.mockGetDomain = exports.mockImportDomain = exports.mockGetDomainRecords = exports.interceptCreateDomainRecord = exports.mockGetDomains = exports.interceptCreateDomain = void 0;
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
/**
 * Intercepts POST request to create a Domain.
 *
 * @returns Cypress chainable.
 */
var interceptCreateDomain = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('domains'));
};
exports.interceptCreateDomain = interceptCreateDomain;
/**
 * Intercepts GET request to mock domain data.
 *
 * @param domains - an array of mock domain objects
 *
 * @returns Cypress chainable.
 */
var mockGetDomains = function (domains) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('domains*'), (0, paginate_1.paginateResponse)(domains));
};
exports.mockGetDomains = mockGetDomains;
/**
 * Intercepts POST request to create a Domain record.
 *
 * @returns Cypress chainable.
 */
var interceptCreateDomainRecord = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('domains/*/record*'));
};
exports.interceptCreateDomainRecord = interceptCreateDomainRecord;
/**
 * Intercepts GET request to get Domain records.
 *
 * @param records - an array of mock domain record objects
 *
 * @returns Cypress chainable.
 */
var mockGetDomainRecords = function (records) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('domains/*/record*'), (0, paginate_1.paginateResponse)(records));
};
exports.mockGetDomainRecords = mockGetDomainRecords;
/**
 * Intercepts POST request to import a Domain Zone.
 *
 * @param domain - a mock domain object
 *
 * @returns Cypress chainable.
 */
var mockImportDomain = function (domain) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('domains/import'), domain);
};
exports.mockImportDomain = mockImportDomain;
/**
 * Intercepts GET request to get a Domain detail.
 *
 * @param domainId - a mock domain ID
 * @param domain - a mock domain
 *
 * @returns Cypress chainable.
 */
var mockGetDomain = function (domainId, domain) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("domains/".concat(domainId)), domain);
};
exports.mockGetDomain = mockGetDomain;
/**
 * Intercepts GET request to get a Domain detail.
 *
 * @param domainId - a mock domain ID
 * @param zoneFile - a mock ZoneFile object
 *
 * @returns Cypress chainable.
 */
var mockGetDomainZoneFile = function (domainId, zoneFile) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("domains/".concat(domainId, "/zone-file")), zoneFile);
};
exports.mockGetDomainZoneFile = mockGetDomainZoneFile;
