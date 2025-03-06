"use strict";
/**
 * @file Cypress intercepts and mocks for NodeBalancer API requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.interceptCreateNodeBalancer = exports.mockGetNodeBalancerFirewalls = exports.mockGetNodeBalancer = exports.mockGetNodeBalancers = void 0;
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
/**
 * Intercepts GET request to mock nodeBalancer data.
 *
 * @param nodeBalancers - an array of mock nodeBalancer objects
 *
 * @returns Cypress chainable.
 */
var mockGetNodeBalancers = function (nodeBalancers) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('nodebalancers*'), (0, paginate_1.paginateResponse)(nodeBalancers));
};
exports.mockGetNodeBalancers = mockGetNodeBalancers;
/**
 * Intercepts GET request to mock a nodeBalancer.
 *
 * @param nodeBalancer - an mock nodeBalancer object
 *
 * @returns Cypress chainable.
 */
var mockGetNodeBalancer = function (nodeBalancer) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("nodebalancers/".concat(nodeBalancer.id)), nodeBalancer);
};
exports.mockGetNodeBalancer = mockGetNodeBalancer;
/**
 * Mocks GET request to get a NodeBalancer's firewalls.
 *
 * @param nodeBalancerId - ID of the NodeBalancer to get firewalls associated with it.
 * @param firewalls - the firewalls with which to mock the response.
 *
 * @returns Cypress Chainable.
 */
var mockGetNodeBalancerFirewalls = function (nodeBalancerId, firewalls) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("nodebalancers/".concat(nodeBalancerId, "/firewalls")), (0, paginate_1.paginateResponse)(firewalls));
};
exports.mockGetNodeBalancerFirewalls = mockGetNodeBalancerFirewalls;
/**
 * Intercepts POST request to intercept nodeBalancer data.
 *
 * @returns Cypress chainable.
 */
var interceptCreateNodeBalancer = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('nodebalancers'));
};
exports.interceptCreateNodeBalancer = interceptCreateNodeBalancer;
