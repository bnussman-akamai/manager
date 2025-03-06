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
var factories_1 = require("@src/factories");
var accountUsers_1 = require("@src/factories/accountUsers");
var luxon_1 = require("luxon");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var mockParentAccount = factories_1.accountFactory.build({
    company: 'Parent Company',
});
var mockParentProfile = factories_1.profileFactory.build({
    username: (0, random_1.randomLabel)(),
    user_type: 'parent',
});
var mockParentUser = accountUsers_1.accountUserFactory.build({
    username: mockParentProfile.username,
    user_type: 'parent',
});
var mockChildAccount = factories_1.accountFactory.build({
    company: 'Partner Company',
});
var mockParentAccountToken = factories_1.appTokenFactory.build({
    id: (0, random_1.randomNumber)(),
    created: luxon_1.DateTime.now().toISO(),
    expiry: luxon_1.DateTime.now().plus({ minutes: 15 }).toISO(),
    label: "".concat(mockParentAccount.company, "_proxy"),
    scopes: '*',
    token: (0, random_1.randomString)(32),
    website: undefined,
    thumbnail_url: undefined,
});
describe('Token scopes', function () {
    /*
     * Confirm that the “Child account access” grant is not visible in the list of permissions.
     * Upon clicking “Create Token”, assert that the outgoing API request payload contains "scopes" value as defined in token.
     */
    it('Token scopes for parent user with restricted access', function () {
        (0, profile_1.mockGetProfile)(mockParentProfile);
        (0, account_1.mockGetAccount)(mockParentAccount);
        (0, account_1.mockGetChildAccounts)([mockChildAccount]);
        (0, profile_1.mockGetProfile)(__assign(__assign({}, mockParentProfile), { restricted: true }));
        (0, account_1.mockGetUser)(mockParentUser);
        (0, profile_1.mockGetPersonalAccessTokens)([]).as('getTokens');
        (0, profile_1.mockGetAppTokens)([]).as('getAppTokens');
        (0, profile_1.mockCreatePersonalAccessToken)(mockParentAccountToken).as('createToken');
        cy.visitWithLogin('/profile/tokens');
        cy.wait(['@getTokens', '@getAppTokens']);
        // Click create button, fill out and submit PAT create form.
        ui_1.ui.button
            .findByTitle('Create a Personal Access Token')
            .should('be.visible')
            .should('be.enabled')
            .click();
        (0, profile_1.mockGetPersonalAccessTokens)([mockParentAccountToken]).as('getTokens');
        ui_1.ui.drawer
            .findByTitle('Add Personal Access Token')
            .should('be.visible')
            .within(function () {
            // Confirm that the “Child account access” grant is not visible in the list of permissions.
            cy.findAllByText('Child Account Access').should('not.exist');
            // Specify ALL scopes by selecting the "No Access" Select All radio button.
            cy.get('[data-qa-perm-rw-radio]').click();
            cy.get('[data-qa-perm-rw-radio]').should('have.attr', 'data-qa-radio', 'true');
            // Specify a label and re-submit.
            cy.findByLabelText('Label').as('qaLabel').scrollIntoView();
            cy.get('@qaLabel').should('be.visible').should('be.enabled').click();
            cy.focused().type(mockParentAccountToken.label);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Token')
                .scrollIntoView()
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that PAT secret dialog is shown and close it.
        cy.wait('@createToken');
        ui_1.ui.dialog
            .findByTitle('Personal Access Token')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('I Have Saved My Personal Access Token')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that new PAT is shown in list and "View Scopes" drawer works.
        // Upon clicking “Create Token”, assert that the outgoing API request payload contains "scopes" value as defined in token.
        cy.wait('@getTokens').then(function (xhr) {
            var _a;
            var actualTokenData = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.data;
            var actualTokenScopes = actualTokenData[0].scopes;
            expect(actualTokenScopes).to.equal(mockParentAccountToken.scopes);
        });
    });
    /*
     * Confirm that the “Child account access” grant is visible in the list of permissions.
     * Upon clicking “Create Token”, assert that the outgoing API request payload contains "scopes" value as defined in token.
     */
    it('Token scopes for parent user with unrestricted access', function () {
        (0, profile_1.mockGetProfile)(mockParentProfile);
        (0, account_1.mockGetAccount)(mockParentAccount);
        (0, account_1.mockGetChildAccounts)([mockChildAccount]);
        (0, profile_1.mockGetProfile)(__assign(__assign({}, mockParentProfile), { restricted: false }));
        (0, account_1.mockGetUser)(mockParentUser);
        (0, profile_1.mockGetPersonalAccessTokens)([]).as('getTokens');
        (0, profile_1.mockGetAppTokens)([]).as('getAppTokens');
        (0, profile_1.mockCreatePersonalAccessToken)(mockParentAccountToken).as('createToken');
        cy.visitWithLogin('/profile/tokens');
        cy.wait(['@getTokens', '@getAppTokens']);
        // Click create button, fill out and submit PAT create form.
        ui_1.ui.button
            .findByTitle('Create a Personal Access Token')
            .should('be.visible')
            .should('be.enabled')
            .click();
        (0, profile_1.mockGetPersonalAccessTokens)([mockParentAccountToken]).as('getTokens');
        ui_1.ui.drawer
            .findByTitle('Add Personal Access Token')
            .should('be.visible')
            .within(function () {
            // Confirm that the “Child account access” grant is not visible in the list of permissions.
            cy.findAllByText('Child Account Access')
                .as('qaChildAccount')
                .scrollIntoView();
            cy.get('@qaChildAccount').should('be.visible');
            // Specify ALL scopes by selecting the "No Access" Select All radio button.
            cy.get('[data-qa-perm-rw-radio]').click();
            cy.get('[data-qa-perm-rw-radio]').should('have.attr', 'data-qa-radio', 'true');
            // Specify a label and re-submit.
            cy.findByLabelText('Label').as('qaLabel').scrollIntoView();
            cy.get('@qaLabel').should('be.visible').should('be.enabled').click();
            cy.focused().type(mockParentAccountToken.label);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Token')
                .scrollIntoView()
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that PAT secret dialog is shown and close it.
        cy.wait('@createToken');
        ui_1.ui.dialog
            .findByTitle('Personal Access Token')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('I Have Saved My Personal Access Token')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that new PAT is shown in list and "View Scopes" drawer works.
        // Upon clicking “Create Token”, assert that the outgoing API request payload contains "scopes" value as defined in token.
        cy.wait('@getTokens').then(function (xhr) {
            var _a;
            var actualTokenData = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.data;
            var actualTokenScopes = actualTokenData[0].scopes;
            expect(actualTokenScopes).to.equal(mockParentAccountToken.scopes);
        });
    });
});
