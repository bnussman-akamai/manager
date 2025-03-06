"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var notification_1 = require("@src/factories/notification");
var events_1 = require("support/intercepts/events");
var notifications = [
    notification_1.notificationFactory.build({
        type: 'migration_scheduled',
        severity: 'critical',
    }),
    notification_1.notificationFactory.build({ type: 'migration_pending', severity: 'major' }),
    notification_1.notificationFactory.build({ type: 'reboot_scheduled', severity: 'minor' }),
    notification_1.notificationFactory.build({ type: 'outage', severity: 'critical' }),
    notification_1.notificationFactory.build({ type: 'ticket_important', severity: 'minor' }),
    notification_1.notificationFactory.build({ type: 'ticket_abuse', severity: 'critical' }),
    notification_1.notificationFactory.build({ type: 'notice', severity: 'major' }),
    notification_1.notificationFactory.build({ type: 'maintenance', severity: 'minor' }),
    notification_1.notificationFactory.build({ type: 'promotion', severity: 'critical' }),
];
describe('verify notification types and icons', function () {
    it("notifications", function () {
        (0, events_1.mockGetNotifications)(notifications).as('mockNotifications');
        cy.visitWithLogin('/linodes');
        cy.wait('@mockNotifications');
        cy.get('button[aria-label="Notifications"]').click();
        cy.get('[data-testid="showMoreButton"').click();
        notifications.forEach(function (notification) {
            cy.get("[data-testid=\"".concat(notification.type, "\"]")).within(function () {
                if (notification.severity != 'minor') {
                    cy.get("[data-testid=\"".concat(notification.severity + 'Icon', "\"]"));
                }
            });
        });
    });
});
