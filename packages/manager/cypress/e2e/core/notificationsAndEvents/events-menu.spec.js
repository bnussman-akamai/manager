"use strict";
/**
 * @file Integration tests for Cloud Manager's events menu.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("support/intercepts/events");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var arrays_1 = require("support/util/arrays");
var luxon_1 = require("luxon");
var random_1 = require("support/util/random");
describe('Notifications Menu', function () {
    /*
     * - Confirms that the notification menu shows all events when 20 or fewer exist.
     */
    it('Shows all recent events when there are 20 or fewer', function () {
        var mockEvents = (0, arrays_1.buildArray)((0, random_1.randomNumber)(1, 20), function (index) {
            return factories_1.eventFactory.build({
                action: 'linode_delete',
                // The response from the API will be ordered by created date, descending.
                created: luxon_1.DateTime.local().minus({ minutes: index }).toISO(),
                percent_complete: null,
                rate: null,
                seen: false,
                duration: null,
                status: 'scheduled',
                entity: {
                    id: 1000 + index,
                    label: "my-linode-".concat(index),
                    type: 'linode',
                    url: "/v4/linode/instances/".concat(1000 + index),
                },
                username: (0, random_1.randomLabel)(),
            });
        });
        (0, events_1.mockGetEvents)(mockEvents).as('getEvents');
        cy.visitWithLogin('/');
        cy.wait('@getEvents');
        ui_1.ui.appBar.find().within(function () {
            cy.findByLabelText('Notifications')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.get('[data-qa-notification-menu]')
            .should('be.visible')
            .within(function () {
            // Confirm that all mocked events are shown in the notification menu.
            mockEvents.forEach(function (event) {
                cy.get("[data-qa-event=\"".concat(event.id, "\"]"))
                    .as('qaEventId')
                    .scrollIntoView();
                cy.get('@qaEventId').should('be.visible');
            });
        });
    });
    /*
     * - Confirms that the notification menu shows no more than 20 events.
     * - Confirms that only the most recently created events are shown.
     */
    it('Shows the 20 most recently created events', function () {
        var mockEvents = (0, arrays_1.buildArray)(25, function (index) {
            return factories_1.eventFactory.build({
                action: 'linode_delete',
                // The response from the API will be ordered by created date, descending.
                created: luxon_1.DateTime.local().minus({ minutes: index }).toISO(),
                percent_complete: null,
                rate: null,
                seen: false,
                duration: null,
                status: 'scheduled',
                entity: {
                    id: 1000 + index,
                    label: "my-linode-".concat(index),
                    type: 'linode',
                    url: "/v4/linode/instances/".concat(1000 + index),
                },
                username: (0, random_1.randomLabel)(),
            });
        });
        var shownEvents = mockEvents.slice(0, 20);
        var hiddenEvents = mockEvents.slice(20);
        (0, events_1.mockGetEvents)(mockEvents).as('getEvents');
        cy.visitWithLogin('/');
        cy.wait('@getEvents');
        ui_1.ui.appBar.find().within(function () {
            cy.findByLabelText('Notifications')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.get('[data-qa-notification-menu]')
            .should('be.visible')
            .within(function () {
            // Confirm that first 20 events in response are displayed.
            shownEvents.forEach(function (event) {
                cy.get("[data-qa-event=\"".concat(event.id, "\"]"))
                    .as('qaEventId')
                    .scrollIntoView();
                cy.get('@qaEventId').should('be.visible');
            });
            // Confirm that last 5 events in response are not displayed.
            hiddenEvents.forEach(function (event) {
                cy.get("[data-qa-event=\"".concat(event.id, "\"]")).should('not.exist');
            });
        });
    });
    /*
     * - Confirms that notification menu contains a notice when no recent events exist.
     */
    it('Shows notice when there are no recent events', function () {
        (0, events_1.mockGetEvents)([]).as('getEvents');
        cy.visitWithLogin('/');
        cy.wait('@getEvents');
        // Find and click Notifications button in Cloud's top app bar.
        ui_1.ui.appBar.find().within(function () {
            cy.findByLabelText('Notifications')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.get('[data-qa-notification-menu]')
            .should('be.visible')
            .within(function () {
            // Use RegEx here to account for cases where the period is and is not present.
            // Period is displayed in Notifications Menu v2, but omitted in v1.
            cy.findByText(/No recent events to display\.?/).should('be.visible');
        });
    });
    /*
     * - Confirms that events in menu are marked as seen upon viewing.
     * - Uses typical mock data setup where IDs are ordered (descending) and all create dates are unique.
     * - Confirms that events are reflected in the UI as being seen or unseen.
     */
    it('Marks events in menu as seen', function () {
        var mockEvents = (0, arrays_1.buildArray)(10, function (index) {
            return factories_1.eventFactory.build({
                // The event with the highest ID is expected to come first in the array.
                id: 5000 - index,
                action: 'linode_delete',
                // The response from the API will be ordered by created date, descending.
                created: luxon_1.DateTime.local().minus({ minutes: index }).toISO(),
                percent_complete: null,
                seen: false,
                rate: null,
                duration: null,
                status: 'scheduled',
                entity: {
                    id: 1000 + index,
                    label: "my-linode-".concat(index),
                    type: 'linode',
                    url: "/v4/linode/instances/".concat(1000 + index),
                },
                username: (0, random_1.randomLabel)(),
            });
        });
        // In this case, we know that the first event in the mocked events response
        // will contain the highest event ID.
        var highestEventId = mockEvents[0].id;
        (0, events_1.mockGetEvents)(mockEvents).as('getEvents');
        (0, events_1.mockMarkEventSeen)(highestEventId).as('markEventsSeen');
        cy.visitWithLogin('/');
        cy.wait('@getEvents');
        // Find and click Notifications button in Cloud's top app bar.
        ui_1.ui.appBar.find().within(function () {
            cy.findByLabelText('Notifications')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm notification menu opens
        cy.get('[data-qa-notification-menu]')
            .should('be.visible')
            .within(function () {
            // Confirm that UI reflects that every event is unseen.
            cy.get('[data-qa-event-seen="false"]').should('have.length', 10);
        });
        // Dismiss the notifications menu by clicking the bell button again.
        ui_1.ui.appBar.find().within(function () {
            // This time we have to pass `force: true` to cy.click()
            // because otherwise Cypress thinks the element is blocked because
            // of the notifications menu popover.
            cy.findByLabelText('Notifications')
                .should('be.visible')
                .should('be.enabled')
                .click({ force: true });
        });
        // Confirm that Cloud fires a request to the `/events/:id/seen` endpoint,
        // where `id` corresponds to the mocked event with the highest ID.
        // If Cloud attempts to mark the wrong event ID as seen, this assertion
        // will fail.
        cy.log("Waiting for request to '/events/".concat(highestEventId, "/seen'"));
        cy.wait('@markEventsSeen');
        ui_1.ui.appBar.find().within(function () {
            cy.findByLabelText('Notifications')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.get('[data-qa-notification-menu]')
            .should('be.visible')
            .within(function () {
            // Confirm that UI reflects that every event is now seen.
            cy.get('[data-qa-event-seen="true"]').should('have.length', 10);
        });
    });
    /*
     * - Confirms event seen logic for non-typical event ordering edge case.
     * - Confirms that Cloud marks the correct event as seen even when it's not the first result.
     */
    it('Marks events in menu as seen with duplicate created dates and out-of-order IDs', function () {
        /*
         * When several events are triggered simultaneously, they may have the
         * same `created` timestamp. Cloud asks for events to be sorted by created
         * date when fetching from the API, but when events have identical timestamps,
         * there is no guarantee in which order they will be returned.
         *
         * As a result, we have to account for cases where the most recent event
         * in reality (e.g. as determined by its ID) is not returned first by the API.
         * This is especially relevant when marking events as 'seen', as we have
         * to explicitly mark the event with the highest ID as seen when the user
         * closes their notification menu.
         */
        var createTime = luxon_1.DateTime.local().minus({ minutes: 2 }).toISO();
        var mockEvents = (0, arrays_1.buildArray)(10, function (index) {
            return factories_1.eventFactory.build({
                // Events are not guaranteed to be ordered by ID; simulate this by using random IDs.
                id: (0, random_1.randomNumber)(1000, 9999),
                action: 'linode_delete',
                // To simulate multiple events occurring simultaneously, give all
                // events the same created timestamp.
                created: createTime,
                percent_complete: null,
                seen: false,
                rate: null,
                duration: null,
                status: 'scheduled',
                entity: {
                    id: 1000 + index,
                    label: "my-linode-".concat(index),
                    type: 'linode',
                    url: "/v4/linode/instances/".concat(1000 + index),
                },
                username: (0, random_1.randomLabel)(),
            });
        });
        // Sort the mockEvents array by id in descending order to simulate API response
        mockEvents.sort(function (a, b) { return b.id - a.id; });
        var highestEventId = mockEvents[0].id;
        (0, events_1.mockGetEvents)(mockEvents).as('getEvents');
        (0, events_1.mockMarkEventSeen)(highestEventId).as('markEventsSeen');
        cy.visitWithLogin('/');
        cy.wait('@getEvents');
        // Find and click Notifications button in Cloud's top app bar.
        ui_1.ui.appBar.find().within(function () {
            cy.findByLabelText('Notifications')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm notification menu opens; we don't care about its contents.
        cy.get('[data-qa-notification-menu]').should('be.visible');
        // Dismiss the notifications menu by clicking the bell button again.
        ui_1.ui.appBar.find().within(function () {
            // This time we have to pass `force: true` to cy.click()
            // because otherwise Cypress thinks the element is blocked because
            // of the notifications menu popover.
            cy.findByLabelText('Notifications')
                .should('be.visible')
                .should('be.enabled')
                .click({ force: true });
        });
        // Confirm that Cloud fires a request to the `/events/:id/seen` endpoint,
        // where `id` corresponds to the mocked event with the highest ID.
        // If Cloud attempts to mark the wrong event ID as seen, this assertion
        // will fail.
        cy.log("Waiting for request to '/events/".concat(highestEventId, "/seen'"));
        cy.wait('@markEventsSeen');
    });
});
