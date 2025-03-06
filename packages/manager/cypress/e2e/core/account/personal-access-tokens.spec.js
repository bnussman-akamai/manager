"use strict";
/**
 * @file Integration tests for personal access token CRUD operations.
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
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var oauth_1 = require("src/factories/oauth");
var profile_2 = require("src/factories/profile");
var constants_1 = require("src/features/Account/constants");
describe('Personal access tokens', function () {
    /*
     * - Uses mocked API requests to confirm UI flow to create a personal access token
     * - Confirms that user is shown an error upon attempting creation without a label
     * - Confirms that user is shown the token secret upon successful PAT creation
     * - Confirms that new personal access token is shown in list
     * - Confirms that user can open and close "View Scopes" drawer
     * - Confirm that the “Child account access” grant is not visible in the list of permissions.
     * - Upon clicking “Create Token”, assert that the outgoing API request payload contains "scopes" value as defined in token.
     */
    it('can create personal access tokens', function () {
        var token = oauth_1.appTokenFactory.build({
            label: (0, random_1.randomLabel)(),
            token: (0, random_1.randomString)(64),
        });
        (0, profile_1.mockGetPersonalAccessTokens)([]).as('getTokens');
        (0, profile_1.mockGetAppTokens)([]).as('getAppTokens');
        (0, profile_1.mockCreatePersonalAccessToken)(token).as('createToken');
        cy.visitWithLogin('/profile/tokens');
        cy.wait(['@getTokens', '@getAppTokens']);
        // Confirm that no PATs or 3rd party app tokens are listed.
        cy.findByLabelText('List of Personal Access Tokens')
            .should('be.visible')
            .within(function () {
            cy.findByText('No items to display.').should('be.visible');
        });
        cy.findByLabelText('List of Third Party Access Tokens')
            .should('be.visible')
            .within(function () {
            cy.findByText('No items to display.').should('be.visible');
        });
        // Click create button, fill out and submit PAT create form.
        ui_1.ui.button
            .findByTitle('Create a Personal Access Token')
            .should('be.visible')
            .should('be.enabled')
            .click();
        (0, profile_1.mockGetPersonalAccessTokens)([token]).as('getTokens');
        ui_1.ui.drawer
            .findByTitle('Add Personal Access Token')
            .should('be.visible')
            .within(function () {
            // Confirm that the “Child account access” grant is not visible in the list of permissions.
            cy.findAllByText('Child Account Access').should('not.exist');
            // Confirm submit button is disabled without specifying scopes.
            ui_1.ui.buttonGroup.findButtonByTitle('Create Token').scrollIntoView();
            ui_1.ui.buttonGroup.findButtonByTitle('Create Token').should('be.disabled');
            // Select just one scope.
            cy.get('[data-qa-row="Account"]').within(function () {
                cy.get('[type="radio"]').first().click();
            });
            // Confirm submit button is still disabled without specifying ALL scopes.
            ui_1.ui.buttonGroup.findButtonByTitle('Create Token').scrollIntoView();
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Token')
                .should('be.visible')
                .should('be.disabled');
            // Specify ALL scopes by selecting the "No Access" Select All radio button.
            cy.get('[data-qa-perm-no-access-radio]').click();
            cy.get('[data-qa-perm-no-access-radio]').should('have.attr', 'data-qa-radio', 'true');
            // Confirm submit button is enabled; attempt to submit form without specifying a label.
            ui_1.ui.buttonGroup.findButtonByTitle('Create Token').scrollIntoView();
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Token')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm validation error.
            cy.findByText('Label must be between 1 and 100 characters.').scrollIntoView();
            cy.findByText('Label must be between 1 and 100 characters.').should('be.visible');
            // Specify a label and re-submit.
            cy.findByLabelText('Label').scrollIntoView();
            cy.findByLabelText('Label')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByLabelText('Label').type(token.label);
            ui_1.ui.buttonGroup.findButtonByTitle('Create Token').scrollIntoView();
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Token')
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
            // Confirm that user is informed that PAT is only shown once, and that
            // it cannot be recovered.
            cy.findByText('we can only display your personal access token once', {
                exact: false,
            }).should('be.visible');
            cy.findByText('it can’t be recovered', { exact: false }).should('be.visible');
            // Confirm that PAT is shown.
            cy.get('[data-testid="textfield-input"]')
                .should('be.visible')
                .should('have.attr', 'value', token.token);
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
            expect(actualTokenScopes).to.equal(token.scopes);
        });
        cy.findByText(token.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('View Scopes')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.drawer
            .findByTitle(token.label)
            .should('be.visible')
            .within(function () {
            ui_1.ui.drawerCloseButton.find().click();
        });
    });
    /*
     * - Uses mocked API requests to confirm UI flow when renaming and revoking tokens
     * - Confirms that list shows the correct label after renaming a token
     * - Confirms that token is removed from list after revoking it
     */
    it('can rename and revoke personal access tokens', function () {
        var oldToken = oauth_1.appTokenFactory.build({
            label: (0, random_1.randomLabel)(),
            token: (0, random_1.randomString)(64),
        });
        var newToken = __assign(__assign({}, oldToken), { label: (0, random_1.randomLabel)() });
        (0, profile_1.mockGetPersonalAccessTokens)([oldToken]).as('getTokens');
        (0, profile_1.mockGetAppTokens)([]).as('getAppTokens');
        (0, profile_1.mockUpdatePersonalAccessToken)(oldToken.id, newToken).as('updateToken');
        (0, profile_1.mockRevokePersonalAccessToken)(oldToken.id).as('revokeToken');
        cy.visitWithLogin('/profile/tokens');
        cy.wait(['@getTokens', '@getAppTokens']);
        // Find token in list, click "Rename", and fill out and submit form.
        cy.findByText(oldToken.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Rename')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        (0, profile_1.mockGetPersonalAccessTokens)([newToken]).as('getTokens');
        ui_1.ui.drawer
            .findByTitle('Edit Personal Access Token')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label').as('qaLabel').should('be.visible').click();
            cy.get('@qaLabel').clear();
            cy.get('@qaLabel').type(newToken.label);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Save')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that token has been renamed, initiate revocation.
        cy.wait(['@updateToken', '@getTokens']);
        cy.findByText(newToken.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Revoke')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        (0, profile_1.mockGetPersonalAccessTokens)([]).as('getTokens');
        ui_1.ui.dialog
            .findByTitle("Revoke ".concat(newToken.label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Revoke')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that token is removed from list after revoking.
        cy.wait(['@revokeToken', '@getTokens']);
        ui_1.ui.toast.assertMessage("Successfully revoked ".concat(newToken.label));
        cy.findByLabelText('List of Personal Access Tokens')
            .should('be.visible')
            .within(function () {
            cy.findByText(newToken.label).should('not.exist');
            cy.findByText('No items to display.').should('be.visible');
        });
    });
    /*
     * - Uses mocked API requests to confirm disabled states for proxy users
     * - Confirms that a proxy user cannot create an API token
     * - Confirms that a proxy user cannot edit (rename) an API token
     * - Confirms that a proxy user can revoke an API token created for them
     * - Confirms that token is removed from list after revoking it
     */
    it('disables API token creation and editing for a proxy user', function () {
        var proxyToken = oauth_1.appTokenFactory.build({
            label: (0, random_1.randomLabel)(),
            token: (0, random_1.randomString)(64),
        });
        var proxyUserProfile = profile_2.profileFactory.build({ user_type: 'proxy' });
        (0, profile_1.mockGetProfile)(proxyUserProfile);
        (0, profile_1.mockGetPersonalAccessTokens)([proxyToken]).as('getTokens');
        (0, profile_1.mockGetAppTokens)([]).as('getAppTokens');
        (0, profile_1.mockRevokePersonalAccessToken)(proxyToken.id).as('revokeToken');
        cy.visitWithLogin('/profile/tokens');
        cy.wait(['@getTokens', '@getAppTokens']);
        // Find token in list, confirm "Rename" is disabled and tooltip displays.
        cy.findByText(proxyToken.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Rename')
                .should('be.visible')
                .should('be.disabled')
                .click();
        });
        ui_1.ui.tooltip
            .findByText(constants_1.PROXY_USER_RESTRICTED_TOOLTIP_TEXT)
            .should('be.visible');
        // Confirm that token has not been renamed, initiate revocation.
        cy.findByText(proxyToken.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Revoke')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        (0, profile_1.mockGetPersonalAccessTokens)([]).as('getTokens');
        ui_1.ui.dialog
            .findByTitle("Revoke ".concat(proxyToken.label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Revoke')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Find 'Create a Personal Access Token' button, confirm it is disabled and tooltip displays.
        ui_1.ui.button
            .findByTitle('Create a Personal Access Token')
            .should('be.visible')
            .should('be.disabled')
            .click();
        ui_1.ui.tooltip
            .findByText(constants_1.PROXY_USER_RESTRICTED_TOOLTIP_TEXT)
            .should('be.visible');
        // Confirm that token is removed from list after revoking.
        cy.wait(['@revokeToken', '@getTokens']);
        ui_1.ui.toast.assertMessage("Successfully revoked ".concat(proxyToken.label));
        cy.findByLabelText('List of Personal Access Tokens')
            .should('be.visible')
            .within(function () {
            cy.findByText(proxyToken.label).should('not.exist');
            cy.findByText('No items to display.').should('be.visible');
        });
    });
});
