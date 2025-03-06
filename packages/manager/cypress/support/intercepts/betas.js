"use strict";
/**
 * @file Mocks and intercepts related to notification and event handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPostBeta = exports.mockGetBeta = exports.mockGetBetas = exports.mockGetAccountBeta = exports.mockGetAccountBetas = void 0;
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
/**
 * Intercepts GET request to fetch account betas (the ones the user has opted into) and mocks response.
 *
 * @param betas - Array of Betas with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetAccountBetas = function (betas) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/betas'), (0, paginate_1.paginateResponse)(betas));
};
exports.mockGetAccountBetas = mockGetAccountBetas;
/**
 * Intercepts GET request to fetch a beta and mocks response.
 *
 * @param beta - Beta with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetAccountBeta = function (beta) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/betas/".concat(beta.id)), (0, response_1.makeResponse)(beta));
};
exports.mockGetAccountBeta = mockGetAccountBeta;
/**
 * Intercepts GET request to fetch available betas (all betas available to the user).
 *
 * @param betas - Array of Betas with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetBetas = function (betas) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("betas"), (0, paginate_1.paginateResponse)(betas));
};
exports.mockGetBetas = mockGetBetas;
/**
 * Intercepts GET request to fetch a beta and mocks response.
 *
 * @param beta - Beta with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetBeta = function (beta) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("betas/".concat(beta.id)), (0, response_1.makeResponse)(beta));
};
exports.mockGetBeta = mockGetBeta;
/**
 * Intercepts POST request to enroll in a beta and mocks response.
 *
 * @param beta - Beta with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockPostBeta = function (beta) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("account/betas"), (0, response_1.makeResponse)(beta));
};
exports.mockPostBeta = mockPostBeta;
