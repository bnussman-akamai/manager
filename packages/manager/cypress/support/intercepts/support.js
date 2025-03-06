"use strict";
/**
 * @file Cypress mock and intercept utilities for Help & Support API requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockGetSupportTicketReplies = exports.mockGetSupportTickets = exports.mockCloseSupportTicket = exports.mockGetSupportTicket = exports.mockAttachSupportTicketFile = exports.mockCreateSupportTicket = void 0;
var intercepts_1 = require("support/util/intercepts");
var response_1 = require("support/util/response");
var paginate_1 = require("support/util/paginate");
/**
 * Intercepts request to open a support ticket and mocks response.
 *
 * @param ticket - Support ticket object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateSupportTicket = function (ticket) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('support/tickets'), (0, response_1.makeResponse)(ticket));
};
exports.mockCreateSupportTicket = mockCreateSupportTicket;
/**
 * Interepts request to attach file to support ticket and mocks response.
 *
 * @param ticketId - Support ticket ID for which to intercept request.
 *
 * @returns Cypress chainable.
 */
var mockAttachSupportTicketFile = function (ticketId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("support/tickets/".concat(ticketId, "/attachments")), {});
};
exports.mockAttachSupportTicketFile = mockAttachSupportTicketFile;
/**
 * Intercepts request to fetch a support ticket and mocks response.
 *
 * @param ticket - Support ticket object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetSupportTicket = function (ticket) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("support/tickets/".concat(ticket.id)), (0, response_1.makeResponse)(ticket));
};
exports.mockGetSupportTicket = mockGetSupportTicket;
/**
 * Interepts request to close a support ticket and mocks response.
 *
 * @param ticketId - Numeric ID of support ticket for which to mock replies.
 *
 * @returns Cypress chainable.
 */
var mockCloseSupportTicket = function (ticketId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("support/tickets/".concat(ticketId, "/close")), (0, response_1.makeResponse)({}));
};
exports.mockCloseSupportTicket = mockCloseSupportTicket;
/**
 * Intercepts request to fetch open support tickets and mocks response.
 *
 * @param tickets - Array of support ticket objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetSupportTickets = function (tickets) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('support/tickets*'), (0, paginate_1.paginateResponse)(tickets));
};
exports.mockGetSupportTickets = mockGetSupportTickets;
/**
 * Interepts request to fetch a support ticket's replies and mocks response.
 *
 * @param ticketId - Numeric ID of support ticket for which to mock replies.
 * @param replies - Array of support ticket reply objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetSupportTicketReplies = function (ticketId, replies) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("support/tickets/".concat(ticketId, "/replies*")), (0, paginate_1.paginateResponse)(replies));
};
exports.mockGetSupportTicketReplies = mockGetSupportTicketReplies;
