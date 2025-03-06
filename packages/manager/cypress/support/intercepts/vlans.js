"use strict";
/**
 * @files Cypress intercepts and mocks for VLAN API requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockGetVLANs = void 0;
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
/**
 * Intercepts GET request to fetch VLANs and mocks response.
 *
 * @param vlans - Array of VLANs with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetVLANs = function (vlans) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('networking/vlans*'), (0, paginate_1.paginateResponse)(vlans));
};
exports.mockGetVLANs = mockGetVLANs;
