"use strict";
/**
 * @file Mocks and intercepts related to notification and event handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockGetNotifications = exports.mockMarkEventSeen = exports.mockGetEventsPolling = exports.mockGetEvents = void 0;
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
/**
 * Intercepts GET request to fetch events and mocks response.
 *
 * @param events - Array of Events with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetEvents = function (events) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/events*'), (0, paginate_1.paginateResponse)(events));
};
exports.mockGetEvents = mockGetEvents;
/**
 * Intercepts polling GET request to fetch events and mocks response.
 *
 * Unlike `mockGetEvents`, this utility only intercepts outgoing requests that
 * occur while Cloud Manager is polling for events.
 *
 * @param events - Array of Events with which to mock response.
 * @param pollingTimestamp - Timestamp to find when identifying polling requests.
 *
 * @returns Cypress chainable.
 */
var mockGetEventsPolling = function (events, pollingTimestamp) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/events*'), function (req) {
        console.log({ headers: req.headers });
        if (req.headers['x-filter'].includes("{\"created\":{\"+gte\":\"".concat(pollingTimestamp, "\"}}"))) {
            req.reply((0, paginate_1.paginateResponse)(events));
        }
        else {
            req.continue();
        }
    });
};
exports.mockGetEventsPolling = mockGetEventsPolling;
/**
 * Intercepts POST request to mark an event as seen and mocks response.
 *
 * @param eventId - ID of the event for which to intercept request.
 *
 * @returns Cypress chainable.
 */
var mockMarkEventSeen = function (eventId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("account/events/".concat(eventId, "/seen")), (0, response_1.makeResponse)({}));
};
exports.mockMarkEventSeen = mockMarkEventSeen;
/**
 * Intercepts GET request to fetch notifications and mocks response.
 *
 * @param notifications - Notifications with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetNotifications = function (notifications) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/notifications*'), (0, paginate_1.paginateResponse)(notifications));
};
exports.mockGetNotifications = mockGetNotifications;
