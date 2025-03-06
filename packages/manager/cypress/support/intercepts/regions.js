"use strict";
/**
 * @file Cypress intercept and mock utilities for Linode regions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockGetRegionsError = exports.mockGetRegionAvailability = exports.mockGetRegions = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var regions_1 = require("support/util/regions");
/**
 * Intercepts GET request to fetch Linode regions and mocks response.
 *
 * The array of mock regions can contain actual API region objects, or Cypress-
 * specific `ExtendedRegion` instances. If `ExtendedRegion` instances are passed,
 * they will be mocked as regular `Region` objects.
 *
 * @param regions - Regions with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetRegions = function (regions) {
    var mockResponseRegions = regions.map(function (region) {
        if ((0, regions_1.isExtendedRegion)(region)) {
            return (0, regions_1.getRegionFromExtendedRegion)(region);
        }
        return region;
    });
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('regions*'), (0, paginate_1.paginateResponse)(mockResponseRegions));
};
exports.mockGetRegions = mockGetRegions;
/**
 * Intercepts GET request to fetch regions availability and mocks response.
 *
 * @returns Cypress chainable.
 */
var mockGetRegionAvailability = function (regionId, regionAvailability) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("regions/".concat(regionId, "/availability")), regionAvailability);
};
exports.mockGetRegionAvailability = mockGetRegionAvailability;
/**
 * Mocks an error response for the GET request to retrieve regions in CloudPulse.
 *
 * This function intercepts the 'GET' request made to the CloudPulse API endpoint for retrieving regions
 * and simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
var mockGetRegionsError = function (errorMessage, status) {
    if (status === void 0) { status = 500; }
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('regions*'), (0, errors_1.makeErrorResponse)(errorMessage, status));
};
exports.mockGetRegionsError = mockGetRegionsError;
