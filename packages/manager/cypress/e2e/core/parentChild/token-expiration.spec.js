"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var linodes_1 = require("support/intercepts/linodes");
var factories_1 = require("src/factories");
var random_1 = require("support/util/random");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var luxon_1 = require("luxon");
var ui_1 = require("support/ui");
var mockChildAccount = factories_1.accountFactory.build({
    company: 'Partner Company',
});
var mockChildAccountProxyUser = factories_1.accountUserFactory.build({
    username: (0, random_1.randomLabel)(),
    user_type: 'proxy',
});
var mockChildAccountProxyProfile = factories_1.profileFactory.build({
    username: mockChildAccountProxyUser.username,
    user_type: 'proxy',
});
describe('Parent/Child token expiration', function () {
    /*
     * - Confirms flow when a Proxy user attempts to switch back to a Parent account with expired auth token.
     * - Uses mock API and local storage data.
     */
    it('shows session expiry prompt upon switching back to Parent account with expired Parent token', function () {
        (0, linodes_1.mockGetLinodes)([]).as('getLinodes');
        (0, account_1.mockGetAccount)(mockChildAccount);
        (0, profile_1.mockGetProfile)(mockChildAccountProxyProfile);
        (0, account_1.mockGetChildAccounts)([]);
        // Mock local storage parent token expiry to have already passed.
        cy.visitWithLogin('/', {
            localStorageOverrides: {
                proxy_user: true,
                'authentication/parent_token/token': "Bearer ".concat((0, random_1.randomString)(32)),
                'authentication/parent_token/expire': luxon_1.DateTime.local()
                    .minus({ minutes: 30 })
                    .toISO(),
                'authentication/parent_token/scopes': '*',
            },
        });
        // Wait for page load, then click "Switch Account" button.
        cy.wait('@getLinodes');
        ui_1.ui.userMenuButton.find().should('be.visible').click();
        ui_1.ui.userMenu
            .find()
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Switch Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm session expiry prompt, and that clicking "Log In" prompts login flow.
        ui_1.ui.dialog
            .findByTitle('Session expired')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Log in')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.url().should('endWith', '/login');
    });
});
