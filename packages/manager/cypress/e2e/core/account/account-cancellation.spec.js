"use strict";
/**
 * @file Integration tests for Cloud Manager account cancellation flows.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/constants/account");
var account_2 = require("support/intercepts/account");
var general_1 = require("support/intercepts/general");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var account_3 = require("src/factories/account");
var profile_2 = require("src/factories/profile");
var constants_1 = require("src/features/Account/constants");
describe('Account cancellation', function () {
    /*
     * - Confirms that a user can cancel their account from the Account Settings page.
     * - Confirms that user is warned that account cancellation is destructive.
     * - Confirms that Cloud Manager displays a notice when an error occurs during cancellation.
     * - Confirms that Cloud Manager includes user comments in cancellation request payload.
     * - Confirms that Cloud Manager shows a survey CTA which directs the user to the expected URL.
     */
    it('users can cancel account', function () {
        var mockAccount = account_3.accountFactory.build();
        var mockProfile = profile_2.profileFactory.build({
            email: 'mock-user@linode.com',
            restricted: false,
        });
        var mockCancellationResponse = {
            survey_link: "https://".concat((0, random_1.randomDomainName)(), "/").concat((0, random_1.randomString)(5)),
        };
        var cancellationComments = (0, random_1.randomPhrase)();
        (0, account_2.mockGetAccount)(mockAccount).as('getAccount');
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        (0, account_2.mockCancelAccountError)(account_1.cancellationPaymentErrorMessage, 409).as('cancelAccount');
        (0, general_1.mockWebpageUrl)(mockCancellationResponse.survey_link, 'This is a mock webpage to confirm Cloud Manager survey link behavior').as('getSurveyPage');
        // Navigate to Account Settings page, click "Close Account" button.
        cy.visitWithLogin('/account/settings');
        cy.wait(['@getAccount', '@getProfile']);
        ui_1.ui.accordion
            .findByTitle('Close Account')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.dialog
            .findByTitle(account_1.cancellationDialogTitle)
            .should('be.visible')
            .within(function () {
            cy.findByText(account_1.cancellationDataLossWarning, { exact: false }).should('be.visible');
            // Confirm that submit button is disabled before entering required info.
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.disabled');
            // Verify checkboxes are present with correct labels
            cy.get('[data-qa-checkbox="deleteAccountServices"]')
                .should('be.visible')
                .should('not.be.checked');
            cy.get('[data-qa-checkbox="deleteAccountUsers"]')
                .should('be.visible')
                .should('not.be.checked');
            // Check both boxes but verify submit remains disabled without email
            cy.get('[data-qa-checkbox="deleteAccountServices"]').click();
            cy.get('[data-qa-checkbox="deleteAccountUsers"]').click();
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.disabled');
            // Enter email, confirm that submit button becomes enabled, and click
            // the submit button.
            cy.findByLabelText("Enter your email address (".concat(mockProfile.email, ")"))
                .should('be.visible')
                .should('be.enabled')
                .type(mockProfile.email);
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm that request payload contains expected data and API error
            // message is displayed in the dialog.
            cy.wait('@cancelAccount').then(function (intercept) {
                expect(intercept.request.body['comments']).to.equal('');
            });
            cy.findByText(account_1.cancellationPaymentErrorMessage).should('be.visible');
            // Enter account cancellation comments, click "Close Account" again,
            // and this time mock a successful account cancellation response.
            (0, account_2.mockCancelAccount)(mockCancellationResponse).as('cancelAccount');
            cy.contains('Comments (optional)').click();
            cy.focused().type(cancellationComments);
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@cancelAccount').then(function (intercept) {
                expect(intercept.request.body['comments']).to.equal(cancellationComments);
            });
        });
        // Confirm that Cloud presents account cancellation screen and prompts the
        // user to complete the exit survey. Confirm that clicking survey button
        // directs the user to the expected URL.
        cy.findByText('It’s been our pleasure to serve you.').should('be.visible');
        ui_1.ui.button
            .findByTitle('Take our exit survey')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@getSurveyPage');
        cy.url().should('equal', mockCancellationResponse.survey_link);
    });
    /*
     * - Confirms Cloud Manager behavior when a restricted user attempts to close an account.
     * - Confirms that API error response message is displayed in cancellation dialog.
     */
    it('restricted users cannot cancel account', function () {
        var mockAccount = account_3.accountFactory.build();
        var mockProfile = profile_2.profileFactory.build({
            email: 'mock-user@linode.com',
            restricted: true,
        });
        (0, account_2.mockGetAccount)(mockAccount).as('getAccount');
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        (0, account_2.mockCancelAccountError)('Unauthorized', 403).as('cancelAccount');
        // Navigate to Account Settings page, click "Close Account" button.
        cy.visitWithLogin('/account/settings');
        cy.wait(['@getAccount', '@getProfile']);
        ui_1.ui.accordion
            .findByTitle('Close Account')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Fill out cancellation dialog and attempt submission.
        ui_1.ui.dialog
            .findByTitle(account_1.cancellationDialogTitle)
            .should('be.visible')
            .within(function () {
            // Check both boxes but verify submit remains disabled without email
            cy.get('[data-qa-checkbox="deleteAccountServices"]').click();
            cy.get('[data-qa-checkbox="deleteAccountUsers"]').click();
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.disabled');
            cy.findByLabelText("Enter your email address (".concat(mockProfile.email, ")"))
                .should('be.visible')
                .should('be.enabled')
                .type(mockProfile.email);
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm that API unauthorized error message is displayed.
            cy.wait('@cancelAccount');
            cy.findByText('Unauthorized').should('be.visible');
        });
    });
});
describe('Parent/Child account cancellation', function () {
    /*
     * - Confirms that a child user cannot close the account.
     */
    it('disables the "Close Account" button for a child user', function () {
        var mockAccount = account_3.accountFactory.build({});
        var mockProfile = profile_2.profileFactory.build({
            email: 'mock-user@linode.com',
            restricted: false,
            user_type: 'child',
        });
        (0, account_2.mockGetAccount)(mockAccount).as('getAccount');
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        // Navigate to Account Settings page, click "Close Account" button.
        cy.visitWithLogin('/account/settings');
        cy.wait(['@getAccount', '@getProfile']);
        ui_1.ui.accordion
            .findByTitle('Close Account')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.disabled')
                .trigger('mouseover');
            // Click the button first, then confirm the tooltip is shown.
            ui_1.ui.tooltip
                .findByText(constants_1.CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT)
                .should('be.visible');
        });
    });
    /**
     * Confirms that a proxy account cannot close the account
     */
    it('disables "Close Account" button for proxy users', function () {
        var mockAccount = account_3.accountFactory.build();
        var mockProfile = profile_2.profileFactory.build({
            email: 'mock-user@linode.com',
            restricted: false,
            user_type: 'proxy',
        });
        (0, account_2.mockGetAccount)(mockAccount).as('getAccount');
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        // Navigate to Account Settings page, click "Close Account" button.
        cy.visitWithLogin('/account/settings');
        cy.wait(['@getAccount', '@getProfile']);
        ui_1.ui.accordion
            .findByTitle('Close Account')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.disabled')
                .trigger('mouseover');
            // Click the button first, then confirm the tooltip is shown.
            ui_1.ui.tooltip
                .findByText(constants_1.PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT)
                .should('be.visible');
        });
    });
    /**
     * Confirms that a parent account with one or more active child accounts cannot close the account
     */
    it('disables "Close Account" button for parent users', function () {
        var mockAccount = account_3.accountFactory.build();
        var mockProfile = profile_2.profileFactory.build({
            email: 'mock-user@linode.com',
            restricted: false,
            user_type: 'parent',
        });
        (0, account_2.mockGetAccount)(mockAccount).as('getAccount');
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        // Navigate to Account Settings page, click "Close Account" button.
        cy.visitWithLogin('/account/settings');
        cy.wait(['@getAccount', '@getProfile']);
        ui_1.ui.accordion
            .findByTitle('Close Account')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.disabled')
                .trigger('mouseover');
            // Click the button first, then confirm the tooltip is shown.
            ui_1.ui.tooltip
                .findByText(constants_1.PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT)
                .should('be.visible');
        });
    });
    /**
     * Confirms that a parent account with no active child accounts can close the account
     */
    it('allows a default account with no active child accounts to close the account', function () {
        var mockAccount = account_3.accountFactory.build();
        var mockProfile = profile_2.profileFactory.build({
            email: 'mock-user@linode.com',
            restricted: false,
            user_type: 'default',
        });
        var mockCancellationResponse = {
            survey_link: "https://".concat((0, random_1.randomDomainName)(), "/").concat((0, random_1.randomString)(5)),
        };
        var cancellationComments = (0, random_1.randomPhrase)();
        (0, account_2.mockGetAccount)(mockAccount).as('getAccount');
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        (0, account_2.mockCancelAccountError)(account_1.cancellationPaymentErrorMessage, 409).as('cancelAccount');
        (0, general_1.mockWebpageUrl)(mockCancellationResponse.survey_link, 'This is a mock webpage to confirm Cloud Manager survey link behavior').as('getSurveyPage');
        // Navigate to Account Settings page, click "Close Account" button.
        cy.visitWithLogin('/account/settings');
        cy.wait(['@getAccount', '@getProfile']);
        ui_1.ui.accordion
            .findByTitle('Close Account')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.dialog
            .findByTitle(account_1.cancellationDialogTitle)
            .should('be.visible')
            .within(function () {
            cy.findByText(account_1.cancellationDataLossWarning, { exact: false }).should('be.visible');
            // Confirm that submit button is disabled before entering required info.
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.disabled');
            // Check both boxes but verify submit remains disabled without email
            cy.get('[data-qa-checkbox="deleteAccountServices"]').click();
            cy.get('[data-qa-checkbox="deleteAccountUsers"]').click();
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.disabled');
            // Enter email, confirm that submit button becomes enabled, and click
            // the submit button.
            cy.findByLabelText("Enter your email address (".concat(mockProfile.email, ")"))
                .should('be.visible')
                .should('be.enabled')
                .type(mockProfile.email);
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm that request payload contains expected data and API error
            // message is displayed in the dialog.
            cy.wait('@cancelAccount').then(function (intercept) {
                expect(intercept.request.body['comments']).to.equal('');
            });
            cy.findByText(account_1.cancellationPaymentErrorMessage).should('be.visible');
            // Enter account cancellation comments, click "Close Account" again,
            // and this time mock a successful account cancellation response.
            (0, account_2.mockCancelAccount)(mockCancellationResponse).as('cancelAccount');
            cy.contains('Comments (optional)').click();
            cy.focused().type(cancellationComments);
            ui_1.ui.button
                .findByTitle('Close Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@cancelAccount').then(function (intercept) {
                expect(intercept.request.body['comments']).to.equal(cancellationComments);
            });
        });
        // Confirm that Cloud presents account cancellation screen and prompts the
        // user to complete the exit survey. Confirm that clicking survey button
        // directs the user to the expected URL.
        cy.findByText('It’s been our pleasure to serve you.').should('be.visible');
        ui_1.ui.button
            .findByTitle('Take our exit survey')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@getSurveyPage');
        cy.url().should('equal', mockCancellationResponse.survey_link);
    });
});
