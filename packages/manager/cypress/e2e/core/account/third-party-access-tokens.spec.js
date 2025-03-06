"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var profile_1 = require("@linode/api-v4/lib/profile");
var factories_1 = require("@src/factories");
require("cypress-file-upload");
var authentication_1 = require("support/api/authentication");
var profile_2 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var formatDate_1 = require("src/utilities/formatDate");
(0, authentication_1.authenticate)();
describe('Third party access tokens', function () {
    var token;
    beforeEach(function () {
        token = factories_1.appTokenFactory.build({
            label: (0, random_1.randomLabel)(),
            token: (0, random_1.randomString)(64),
        });
        (0, profile_2.mockGetPersonalAccessTokens)([]).as('getTokens');
        (0, profile_2.mockGetAppTokens)([token]).as('getAppTokens');
        cy.visitWithLogin('/profile/tokens');
        cy.wait(['@getTokens', '@getAppTokens']);
    });
    /*
     * - List of third party access tokens
     * - Confirms that third party apps are listed with expected information.
     */
    it('Third party access tokens are listed with expected information', function () {
        cy.findByText(token.label)
            .closest('tr')
            .within(function () {
            cy.findByText(token.label).should('be.visible');
            cy.defer(function () { return (0, profile_1.getProfile)(); }).then(function (profile) {
                var dateFormatOptions = { timezone: profile.timezone };
                cy.findByText((0, formatDate_1.formatDate)(token.created, dateFormatOptions)).should('be.visible');
            });
            cy.findByText('never').should('be.visible');
        });
    });
    /*
     * - View scopes of a third party access token
     * - Confirms that 'View Scopes' opens a drawer and shows the correct information.
     */
    it('Views scopes of a third party access token', function () {
        var access = factories_1.accessFactory.build({
            Linodes: 2,
        });
        cy.findByText(token.label)
            .closest('tr')
            .within(function () {
            ui_1.ui.button.findByTitle('View Scopes').should('be.visible').click();
        });
        ui_1.ui.drawer
            .findByTitle(token.label)
            .should('be.visible')
            .within(function () {
            Object.keys(access).forEach(function (key) {
                cy.findByText(key)
                    .closest('tr')
                    .within(function () {
                    cy.findByLabelText("This token has ".concat(access[key], " access for ").concat(key.toLowerCase())).should('be.visible');
                });
            });
        });
    });
    /*
     * - Revoke a third party access token
     * - Confirms that revoke works as expected and third party apps list updates accordingly.
     */
    it('Revokes a third party access token', function () {
        // Cancelling will keep the list unchanged.
        cy.findByText(token.label)
            .closest('tr')
            .within(function () {
            ui_1.ui.button.findByTitle('Revoke').should('be.visible').click();
        });
        ui_1.ui.dialog
            .findByTitle("Revoke ".concat(token.label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirms revoke will remove the third party app.
        (0, profile_2.mockRevokeAppToken)(token.id).as('deleteAppToken');
        cy.findByText(token.label)
            .closest('tr')
            .within(function () {
            ui_1.ui.button.findByTitle('Revoke').should('be.visible').click();
        });
        ui_1.ui.dialog
            .findByTitle("Revoke ".concat(token.label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Revoke')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@deleteAppToken');
        (0, profile_2.mockGetPersonalAccessTokens)([]).as('getTokens');
        (0, profile_2.mockGetAppTokens)([]).as('getAppTokens');
        cy.visitWithLogin('/profile/tokens');
        cy.wait(['@getTokens', '@getAppTokens']);
        cy.findByText(token.label).should('not.exist');
    });
});
