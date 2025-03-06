"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var account_1 = require("support/api/account");
var account_2 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var profile_2 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var constants_1 = require("src/features/Account/constants");
var verifyUsernameAndEmail = function (mockRestrictedProxyProfile, tooltip, checkEmail) {
    (0, profile_2.mockGetProfile)(mockRestrictedProxyProfile);
    // Navigate to User Profile page
    cy.visitWithLogin('/profile/display');
    // Confirm the username and email address fields are disabled, as well their respective save buttons
    cy.get('[id="username"]').should('be.disabled');
    ui_1.ui.button
        .findByTitle('Update Username')
        .should('be.visible')
        .should('be.disabled')
        .trigger('mouseover');
    // Click the button first, then confirm the tooltip is shown
    ui_1.ui.tooltip.findByText(tooltip).should('be.visible');
    // Refresh the page
    (0, profile_2.mockGetProfile)(mockRestrictedProxyProfile);
    cy.reload();
    if (checkEmail) {
        cy.get('[id="email"]').should('be.disabled');
        ui_1.ui.button
            .findByTitle('Update Email')
            .should('be.visible')
            .should('be.disabled')
            .trigger('mouseover');
        // Click the button first, then confirm the tooltip is shown
        ui_1.ui.tooltip.findByText(constants_1.RESTRICTED_FIELD_TOOLTIP).should('be.visible');
    }
};
describe('Display Settings', function () {
    /*
     * - Validates username update flow via the profile display page using mocked data.
     */
    it('can change username via profile display page', function () {
        var newUsername = (0, random_1.randomString)(12);
        (0, account_1.getProfile)().then(function (profile) {
            var username = profile.body.username;
            (0, profile_1.interceptGetProfile)().as('getUserProfile');
            (0, account_2.mockUpdateUsername)(username, newUsername).as('updateUsername');
            cy.visitWithLogin('/profile/display');
            cy.wait('@getUserProfile');
            ui_1.ui.button
                .findByTitle('Update Username')
                .should('be.visible')
                .should('be.disabled');
            cy.findByLabelText('Username')
                .should('be.visible')
                .should('have.value', username)
                .clear();
            cy.focused().type(newUsername);
            ui_1.ui.button
                .findByTitle('Update Username')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@updateUsername');
            cy.findByLabelText('Username')
                .should('be.visible')
                .should('have.value', newUsername);
            cy.findByText('Username updated successfully.').should('be.visible');
        });
    });
    it('disables username/email fields for restricted proxy user', function () {
        var mockRestrictedProxyProfile = factories_1.profileFactory.build({
            restricted: true,
            user_type: 'proxy',
            username: 'restricted-proxy-user',
        });
        verifyUsernameAndEmail(mockRestrictedProxyProfile, constants_1.RESTRICTED_FIELD_TOOLTIP, true);
    });
    it('disables username/email fields for unrestricted proxy user', function () {
        var mockUnrestrictedProxyProfile = factories_1.profileFactory.build({
            user_type: 'proxy',
            username: 'unrestricted-proxy-user',
        });
        verifyUsernameAndEmail(mockUnrestrictedProxyProfile, constants_1.RESTRICTED_FIELD_TOOLTIP, true);
    });
    it('disables username/email fields for regular restricted user', function () {
        var mockRegularRestrictedProfile = factories_1.profileFactory.build({
            restricted: true,
            user_type: 'default',
            username: 'regular-restricted-user',
        });
        verifyUsernameAndEmail(mockRegularRestrictedProfile, 'Restricted users cannot update their username. Please contact an account administrator.', false);
    });
});
