"use strict";
/**
 * @file Integration tests for Cloud Manager email bounce banners.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var notification_1 = require("@src/factories/notification");
var account_1 = require("support/api/account");
var account_2 = require("support/intercepts/account");
var events_1 = require("support/intercepts/events");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var account_3 = require("src/factories/account");
var notifications_billing_email_bounce = [
    notification_1.notificationFactory.build({
        severity: 'major',
        type: 'billing_email_bounce',
    }),
];
var notifications_user_email_bounce = [
    notification_1.notificationFactory.build({
        severity: 'major',
        type: 'user_email_bounce',
    }),
];
var confirmButton = 'Yes it’s correct.';
var updateButton = 'No, let’s update it.';
describe('Email bounce banners', function () {
    /*
     * Confirm that the user profile email banner appears when the user_email_bounce notification is present
     * Confirm that clicking "Yes, it's correct" causes a PUT request to be made to the API account endpoint containing the current user profile email address
     */
    it('User profile email bounce is visible and can be confirmed by users', function () {
        (0, account_1.getProfile)().then(function (profile) {
            var userprofileEmail = profile.body.email;
            var UserProfileEmailBounceBanner = "An email to your user profile\u2019s email address couldn\u2019t be delivered. Is ".concat(userprofileEmail, " the correct address?");
            (0, events_1.mockGetNotifications)(notifications_user_email_bounce).as('mockNotifications');
            cy.visitWithLogin('/account/users');
            cy.wait('@mockNotifications');
            (0, profile_1.mockUpdateProfile)(__assign(__assign({}, profile.body), { email: userprofileEmail })).as('updateEmail');
            cy.contains(UserProfileEmailBounceBanner)
                .should('be.visible')
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByTitle(confirmButton)
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            ui_1.ui.toast.assertMessage('Email confirmed');
            cy.contains(UserProfileEmailBounceBanner).should('not.exist');
            cy.wait('@updateEmail');
            cy.findByText("".concat(userprofileEmail)).should('be.visible');
        });
    });
    /*
     * Confirm that the user profile email banner appears when the user_email_bounce notification is present
     * Confirm that clicking "No, let's update it" redirects the user to {{/account} and that the contact info edit drawer is automatically opened
     */
    // TODO unskip the test once M3-8181 is fixed
    it.skip('User profile email bounce is visible and can be updated by users', function () {
        var newEmail = "".concat((0, random_1.randomString)(12), "@example.com");
        (0, account_1.getProfile)().then(function (profile) {
            var userprofileEmail = profile.body.email;
            var UserProfileEmailBounceBanner = "An email to your user profile\u2019s email address couldn\u2019t be delivered. Is ".concat(userprofileEmail, " the correct address?");
            (0, events_1.mockGetNotifications)(notifications_user_email_bounce).as('mockNotifications');
            cy.visitWithLogin('/account/users');
            cy.wait('@mockNotifications');
            cy.contains(UserProfileEmailBounceBanner)
                .should('be.visible')
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByTitle(updateButton)
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.get('[id="email"]')
                .should('be.visible')
                .should('have.value', userprofileEmail)
                .clear();
            cy.focused().type(newEmail);
            cy.get('[data-qa-textfield-label="Email"]')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Update Email')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.findByText('Email updated successfully.').should('be.visible');
            // see M3-8181
            cy.contains(UserProfileEmailBounceBanner).should('not.exist');
        });
    });
    /*
     *   Confirm that the billing email banner appears when the billing_email_bounce notification is present
     *   Confirm that clicking "Yes, it's correct" causes a PUT request to be made to the API account endpoint containing the current billing email address
     */
    it('Billing email bounce is visible and can be confirmed by users', function () {
        var accountData = account_3.accountFactory.build();
        // mock the user's account data and confirm that it is displayed correctly upon page load
        (0, account_2.mockUpdateAccount)(accountData).as('updateAccount');
        // get the user's account data for Cloud to inject the email address into the notification
        (0, account_2.mockGetAccount)(accountData).as('getAccount');
        var billingemail = accountData.email;
        var BillingEmailBounceBanner = "An email to your account\u2019s email address couldn\u2019t be delivered. Is ".concat(billingemail, " the correct address?");
        (0, events_1.mockGetNotifications)(notifications_billing_email_bounce).as('mockNotifications');
        cy.visitWithLogin('/account/billing');
        cy.wait(['@mockNotifications', '@getAccount']);
        // check the billing email bounce banner and click the confirm button
        cy.contains(BillingEmailBounceBanner)
            .should('be.visible')
            .parent()
            .parent()
            .within(function () {
            ui_1.ui.button
                .findByTitle(confirmButton)
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // check the toast notification
        cy.wait('@updateAccount');
        ui_1.ui.toast.assertMessage('Email confirmed');
        // confirm the billing email bounce banner not exist after clicking the confirm button
        cy.contains(BillingEmailBounceBanner).should('not.exist');
        // confirm the email address is visible in Billing Contact
        cy.findByText('Billing Contact')
            .should('be.visible')
            .parent()
            .parent()
            .within(function () {
            cy.findByText("".concat(billingemail)).should('be.visible');
        });
    });
    /*
     *   Confirm that the billing email banner appears when the billing_email_bounce notification is present
     *   Confirm that clicking "No, let's update it" redirects the user to {{/account} and that the contact info edit drawer is automatically opened
     */
    // TODO unskip the test once M3-8181 is fixed
    it.skip('Billing email bounce is visible and can be updated by users', function () {
        var accountData = account_3.accountFactory.build();
        // mock the user's account data and confirm that it is displayed correctly upon page load
        (0, account_2.mockUpdateAccount)(accountData).as('updateAccount');
        // get the user's account data for Cloud to inject the email address into the notification
        (0, account_2.mockGetAccount)(accountData).as('getAccount');
        var billingemail = accountData.email;
        var BillingEmailBounceBanner = "An email to your account\u2019s email address couldn\u2019t be delivered. Is ".concat(billingemail, " the correct address?");
        (0, events_1.mockGetNotifications)(notifications_billing_email_bounce).as('mockNotifications');
        cy.visitWithLogin('/account/billing');
        cy.wait(['@mockNotifications', '@getAccount']);
        cy.contains(BillingEmailBounceBanner)
            .should('be.visible')
            .parent()
            .parent()
            .within(function () {
            ui_1.ui.button
                .findByTitle(updateButton)
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        //  see M3-8181
        cy.contains(BillingEmailBounceBanner).should('not.exist');
    });
});
