"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUpdateIPAddress = void 0;
var intercepts_1 = require("support/util/intercepts");
/**
 * Mocks PUT request to update an IP address.
 *
 * @param address - the IP address to update
 * @param rdns - the updated RDNS of the IP address
 *
 * @returns Cypress chainable.
 */
var mockUpdateIPAddress = function (address, rdns) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("/networking/ips/".concat(address)), rdns);
};
exports.mockUpdateIPAddress = mockUpdateIPAddress;
