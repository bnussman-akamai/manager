"use strict";
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
var account_1 = require("support/api/account");
var account_2 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var accountUsers_1 = require("src/factories/accountUsers");
var constants_1 = require("src/features/Account/constants");
describe('User Profile', function () {
    /*
     * - Validates the flow of updating the username and email of the active account user via the User Profile page using mocked data.
     */
    it('can change email and username of the active account', function () {
        var newUsername = (0, random_1.randomString)(12);
        var newEmail = "".concat(newUsername, "@example.com");
        (0, account_1.getProfile)().then(function (profile) {
            var activeUsername = profile.body.username;
            var activeEmail = profile.body.email;
            (0, account_2.interceptGetUser)(activeUsername).as('getUser');
            (0, account_2.mockUpdateUsername)(activeUsername, newUsername).as('updateUsername');
            (0, profile_1.mockUpdateProfile)(__assign(__assign({}, profile.body), { email: newEmail })).as('updateEmail');
            cy.visitWithLogin("account/users/".concat(activeUsername));
            cy.wait('@getUser');
            cy.findByLabelText('Username').should('be.visible');
            cy.findByLabelText('Email').should('be.visible');
            cy.findByText('Delete User').should('be.visible');
            // Confirm the currently active user cannot be deleted.
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.disabled')
                .trigger('mouseover');
            // Click the button first, then confirm the tooltip is shown.
            ui_1.ui.tooltip
                .findByText("You can\u2019t delete the currently active user.")
                .should('be.visible');
            // Confirm user can update their email before updating the username, since you cannot update a different user's (as determined by username) email.
            cy.get('[id="email"]')
                .should('be.visible')
                .should('have.value', activeEmail)
                .clear();
            cy.focused().type(newEmail);
            cy.get('[data-qa-textfield-label="Email"]')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Save')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@updateEmail');
            // Confirm success notice displays.
            cy.findByText('Email updated successfully').should('be.visible');
            // Confirm user can update their username.
            cy.get('[id="username"]')
                .should('be.visible')
                .should('have.value', activeUsername)
                .clear();
            cy.focused().type(newUsername);
            cy.get('[data-qa-textfield-label="Username"]')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Save')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@updateUsername');
            // No confirmation gets shown on this page when changes are saved.
            // Confirm that the text field has the correct value instead.
            cy.get('[id="username"]')
                .should('be.visible')
                .should('have.value', newUsername);
        });
    });
    /*
     * - Validates the flow of updating the username and email of another user via the User Profile page using mocked data.
     */
    it('can change the username but not email of another user account', function () {
        var newUsername = (0, random_1.randomString)(12);
        (0, account_1.getProfile)().then(function (profile) {
            var additionalUsername = 'mock_user2';
            var mockAccountUsers = accountUsers_1.accountUserFactory.buildList(1, {
                username: additionalUsername,
            });
            var additionalUser = mockAccountUsers[0];
            (0, account_2.mockGetUsers)(mockAccountUsers).as('getUsers');
            (0, account_2.mockGetUser)(additionalUser).as('getUser');
            (0, account_2.mockUpdateUsername)(additionalUsername, newUsername).as('updateUsername');
            cy.visitWithLogin("account/users/".concat(additionalUsername));
            cy.wait('@getUser');
            cy.findByLabelText('Username').should('be.visible');
            cy.findByLabelText('Email').should('be.visible');
            cy.findByText('Delete User').should('be.visible');
            ui_1.ui.button.findByTitle('Delete').should('be.visible').should('be.enabled');
            // Confirm email of another user cannot be updated.
            cy.get('[id="email"]')
                .should('be.visible')
                .should('have.value', additionalUser.email)
                .should('be.disabled')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByAttribute('data-qa-help-button', 'true')
                    .should('be.visible')
                    .trigger('mouseover');
                // Click the button first, then confirm the tooltip is shown.
                ui_1.ui.tooltip
                    .findByText("You can\u2019t change another user\u2019s email address.")
                    .should('be.visible');
            });
            cy.get('[data-qa-textfield-label="Email"]')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Save')
                    .should('be.visible')
                    .should('be.disabled')
                    .click();
            });
            // Confirm username of another user can be updated.
            cy.get('[id="username"]')
                .should('be.visible')
                .should('have.value', additionalUsername)
                .clear();
            cy.focused().type(newUsername);
            cy.get('[data-qa-textfield-label="Username"]')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Save')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@updateUsername');
            // No confirmation gets shown on this page when changes are saved.
            // Confirm that the text field has the correct value instead.
            cy.get('[id="username"]')
                .should('be.visible')
                .should('have.value', newUsername);
        });
    });
    /*
     * - Validates disabled username and email flow for a proxy user via the User Profile page using mocked data.
     */
    it('cannot change username or email for a proxy user or delete the proxy user', function () {
        (0, account_1.getProfile)().then(function (profile) {
            var proxyUsername = 'proxy_user';
            var mockAccountUsers = accountUsers_1.accountUserFactory.buildList(1, {
                user_type: 'proxy',
                username: proxyUsername,
            });
            (0, account_2.mockGetUsers)(mockAccountUsers).as('getUsers');
            (0, account_2.mockGetUser)(mockAccountUsers[0]).as('getUser');
            cy.visitWithLogin("account/users/".concat(proxyUsername));
            cy.wait('@getUser');
            cy.findByLabelText('Username').should('be.visible');
            cy.findByLabelText('Email').should('be.visible');
            cy.findByText('Delete User').should('be.visible');
            cy.get('[id="username"]')
                .should('be.visible')
                .should('have.value', proxyUsername)
                .should('be.disabled')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByAttribute('data-qa-help-button', 'true')
                    .should('be.visible')
                    .trigger('mouseover');
                // Click the button first, then confirm the tooltip is shown.
                ui_1.ui.tooltip.findByText(constants_1.RESTRICTED_FIELD_TOOLTIP).should('be.visible');
            });
            cy.get('[data-qa-textfield-label="Username"]')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Save')
                    .should('be.visible')
                    .should('be.disabled');
            });
            cy.get('[id="email"]')
                .should('be.visible')
                .should('be.disabled')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByAttribute('data-qa-help-button', 'true')
                    .should('be.visible')
                    .trigger('mouseover');
                // Click the button first, then confirm the tooltip is shown.
                ui_1.ui.tooltip.findByText(constants_1.RESTRICTED_FIELD_TOOLTIP).should('be.visible');
            });
            cy.get('[data-qa-textfield-label="Email"]')
                .parent()
                .parent()
                .parent()
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Save')
                    .should('be.visible')
                    .should('be.disabled')
                    .click();
            });
            // Confirms the proxy user cannot be deleted.
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.disabled')
                .trigger('mouseover');
            // Click the button first, then confirm the tooltip is shown.
            ui_1.ui.tooltip
                .findByText("You can\u2019t delete a ".concat(constants_1.PARENT_USER, "."))
                .should('be.visible');
        });
    });
});
