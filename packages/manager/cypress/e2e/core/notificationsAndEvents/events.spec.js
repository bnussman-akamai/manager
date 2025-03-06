"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("@src/factories/events");
var events_2 = require("support/intercepts/events");
var api_v4_1 = require("@linode/api-v4");
var events = api_v4_1.EventActionKeys.map(function (action) {
    return events_1.eventFactory.build({
        action: action,
        message: "".concat(action + ' message'),
        seen: false,
        read: false,
        percent_complete: null,
        entity: { id: 0, label: 'linode-0' },
    });
});
describe('verify notification types and icons', function () {
    it("notifications", function () {
        (0, events_2.mockGetEvents)(events).as('mockEvents');
        cy.visitWithLogin('/linodes');
        cy.wait('@mockEvents').then(function () {
            var _a;
            cy.get('button[aria-label="Notifications"]').click();
            var _loop_1 = function (i) {
                // Skip account_agreement_eu_model action since it is a special case
                if (events[i].action === 'account_agreement_eu_model') {
                    return { value: void 0 };
                }
                var text = ["".concat(events[i].message), "".concat((_a = events[i].entity) === null || _a === void 0 ? void 0 : _a.label)];
                var regex = new RegExp("".concat(text.join('|')), 'g');
                cy.get("[data-testid=\"".concat(events[i].action, "\"]")).within(function () {
                    cy.contains(regex);
                });
            };
            for (var i = 0; i < 20; i++) {
                var state_1 = _loop_1(i);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            cy.get('button[aria-label="View all events"]').click();
            // Clicking "View all events" navigates to Events page at /events
            cy.url().should('endWith', '/events');
            events.forEach(function (event) {
                var _a;
                var text = ["".concat(event.message), "".concat((_a = event.entity) === null || _a === void 0 ? void 0 : _a.label)];
                var regex = new RegExp("".concat(text.join('|')), 'g');
                cy.get("[data-testid=\"".concat(event.action, "\"]")).within(function () {
                    cy.contains(regex);
                });
            });
        });
    });
});
