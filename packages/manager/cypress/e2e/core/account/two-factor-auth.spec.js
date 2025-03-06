"use strict";
/**
 * @file Integration tests for account two-factor authentication functionality.
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
var profile_2 = require("src/factories/profile");
/**
 * Returns a Cypress chainable for the "Two-Factor Authentication".
 *
 * @returns Cypress chainable for 2fa page section.
 */
var getTwoFactorSection = function () {
    return cy.contains('h3', 'Two-Factor Authentication (2FA)').parent();
};
/**
 * Generates a random 2FA scratch code for mocking.
 *
 * @returns 2FA scratch code.
 */
var randomScratchCode = function () {
    var randomScratchCodeOptions = {
        lowercase: true,
        numbers: false,
        spaces: false,
        symbols: false,
        uppercase: false,
    };
    var segmentA = (0, random_1.randomString)(5, randomScratchCodeOptions);
    var segmentB = (0, random_1.randomString)(5, randomScratchCodeOptions);
    var segmentC = (0, random_1.randomString)(5, randomScratchCodeOptions);
    var segmentD = (0, random_1.randomString)(4, randomScratchCodeOptions);
    return "".concat(segmentA, "-").concat(segmentB, "-").concat(segmentC, "-").concat(segmentD);
};
/**
 * Generates a random 2FA token for mocking.
 *
 * @returns 2FA token.
 */
var randomToken = function () {
    var randomTokenOptions = {
        lowercase: false,
        numbers: true,
        spaces: false,
        symbols: false,
        uppercase: false,
    };
    return (0, random_1.randomString)(6, randomTokenOptions);
};
/**
 * Returns unanswered security question data for mocking.
 *
 * @returns Unanswered security question data.
 */
var getUnansweredSecurityQuestions = function () {
    return profile_2.securityQuestionsFactory.build();
};
/**
 * Returns answered security question data for mocking.
 *
 * @returns Answered security question data.
 */
var getAnsweredSecurityQuestions = function () {
    var securityQuestions = profile_2.securityQuestionsFactory.build();
    // Pre-set answers for security questions.
    var securityQuestionAnswers = [
        (0, random_1.randomString)(10),
        (0, random_1.randomString)(10),
        (0, random_1.randomString)(10),
    ];
    securityQuestions.security_questions[0].response = securityQuestionAnswers[0];
    securityQuestions.security_questions[1].response = securityQuestionAnswers[1];
    securityQuestions.security_questions[2].response = securityQuestionAnswers[2];
    return securityQuestions;
};
// User profile with 2FA disabled.
var userProfile = profile_2.profileFactory.build({
    two_factor_auth: false,
    uid: (0, random_1.randomNumber)(1000, 9999),
    username: (0, random_1.randomLabel)(),
    verified_phone_number: undefined,
});
// User profile with 2FA enabled.
var userProfileTwoFactorEnabled = __assign(__assign({}, userProfile), { two_factor_auth: true });
// Error that appears when an invalid token is submitted when enabling 2FA.
var invalidTokenError = 'Invalid token. Two-factor auth not enabled. Please try again.';
// Message that appears when the user has enabled 2FA.
var enabledMessage = 'Two-factor authentication has been enabled.';
// Message that appears when the user has disabled 2FA.
var disabledMessage = 'Two-factor authentication has been disabled.';
// Warning message that appears when the user is resetting 2FA.
var resetWarningMessage = 'Confirming a new key will invalidate codes generated from any previous key.';
// Warning message that appears when security questions are not answered.
var securityQuestionsMessage = 'To use two-factor authentication you must set up your security questions listed below.';
describe('Two-factor authentication', function () {
    /*
     * - Validates 2FA enable flow using mocked data.
     * - Confirms UI flow when user enables 2FA and enters a valid token.
     * - Confirms UI flow when user enters an invalid token when enabling 2FA.
     * - Confirms that user is shown instructions to keep scratch code safe.
     */
    it('can enable two factor auth', function () {
        var invalidToken = randomToken();
        var validToken = randomToken();
        var mockedKey = (0, random_1.randomHex)(16);
        var mockedScratchCode = randomScratchCode();
        // Mock profile data to ensure that 2FA is disabled.
        (0, profile_1.mockGetProfile)(userProfile).as('getProfile');
        (0, profile_1.mockGetSecurityQuestions)(getAnsweredSecurityQuestions()).as('getSecurityQuestions');
        cy.visitWithLogin('/profile/auth');
        cy.wait('@getProfile');
        cy.wait('@getSecurityQuestions');
        getTwoFactorSection().within(function () {
            (0, profile_1.mockEnableTwoFactorAuth)(mockedKey).as('enableTwoFactorAuth');
            ui_1.ui.toggle
                .find()
                .should('have.attr', 'data-qa-toggle', 'false')
                .should('be.visible')
                .click();
            cy.wait('@enableTwoFactorAuth');
            cy.get('[data-qa-qr-code]').should('be.visible');
            cy.findByLabelText('Secret Key')
                .should('be.visible')
                .should('have.value', mockedKey);
            // Type an invalid token first, confirm that error message appears as expected.
            cy.findByLabelText('Token').should('be.visible').type(invalidToken);
            ui_1.ui.button
                .findByTitle('Confirm Token')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText(invalidTokenError).should('be.visible');
            // Type a valid token, confirm that 2fa is enabled and scratch code is shown.
            (0, profile_1.mockConfirmTwoFactorAuth)(mockedScratchCode).as('confirmTwoFactorAuth');
            (0, profile_1.mockGetProfile)(userProfileTwoFactorEnabled).as('getProfileTwoFactorEnabled');
            cy.findByLabelText('Token').should('be.visible').type(validToken);
            ui_1.ui.button
                .findByTitle('Confirm Token')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@confirmTwoFactorAuth');
            cy.wait('@getProfileTwoFactorEnabled');
        });
        ui_1.ui.dialog
            .findByTitle('Scratch Code')
            .should('be.visible')
            .within(function () {
            /*
             * Confirm that the user is instructed:
             *
             * - To write down their scratch code.
             * - That Cloud Manager will not show them their scratch code again.
             */
            var instructionNoteSecurely = 'make a note of it and keep it secure';
            var instructionOneTimeAccess = 'this is the only time it will appear';
            cy.findByText(instructionNoteSecurely, { exact: false }).should('be.visible');
            cy.findByText(instructionOneTimeAccess, { exact: false }).should('be.visible');
            // Confirm that scratch code is shown.
            cy.findByText(mockedScratchCode).should('be.visible');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Got it')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that two-factor authentication is now enabled.
        getTwoFactorSection().within(function () {
            cy.findByText(enabledMessage).should('be.visible');
            ui_1.ui.toggle
                .find()
                .should('have.attr', 'data-qa-toggle', 'true')
                .should('be.visible');
        });
    });
    /**
     * - Validates 2FA disable flow using mocked data.
     */
    it('can disable two factor auth', function () {
        (0, profile_1.mockGetProfile)(userProfileTwoFactorEnabled).as('getProfile');
        (0, profile_1.mockGetSecurityQuestions)(getAnsweredSecurityQuestions()).as('getSecurityQuestions');
        cy.visitWithLogin('/profile/auth');
        cy.wait('@getProfile');
        cy.wait('@getSecurityQuestions');
        (0, profile_1.mockDisableTwoFactorAuth)().as('disableTwoFactorAuth');
        (0, profile_1.mockGetProfile)(userProfile).as('getProfileTwoFactorDisabled');
        // Confirm that 2FA is already enabled.
        getTwoFactorSection().within(function () {
            ui_1.ui.toggle
                .find()
                .should('have.attr', 'data-qa-toggle', 'true')
                .should('be.visible')
                .click();
        });
        // Handle 2FA disable confirmation prompt.
        ui_1.ui.dialog.findByTitle('Disable Two-Factor Authentication').within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Disable Two-factor Authentication')
                .click();
        });
        cy.wait('@disableTwoFactorAuth');
        cy.wait('@getProfileTwoFactorDisabled');
        // Confirm that 2FA is now disabled.
        getTwoFactorSection().within(function () {
            cy.findByText(disabledMessage).should('be.visible');
            ui_1.ui.toggle
                .find()
                .should('have.attr', 'data-qa-toggle', 'false')
                .should('be.visible');
        });
    });
    /**
     * - Validates 2FA reset flow using mocked data.
     * - Confirms that user is warned that resetting 2FA will invalidate 2FA codes.
     */
    it('can reset two factor auth', function () {
        var validToken = randomToken();
        var mockedScratchCode = randomScratchCode();
        (0, profile_1.mockGetProfile)(userProfileTwoFactorEnabled).as('getProfile');
        (0, profile_1.mockGetSecurityQuestions)(getAnsweredSecurityQuestions()).as('getSecurityQuestions');
        cy.visitWithLogin('/profile/auth');
        cy.wait('@getProfile');
        cy.wait('@getSecurityQuestions');
        getTwoFactorSection().within(function () {
            (0, profile_1.mockEnableTwoFactorAuth)((0, random_1.randomHex)(16)).as('resetTwoFactorAuth');
            // Confirm that reset link is present, click on it.
            cy.findByText('Reset two-factor authentication')
                .should('be.visible')
                .click();
            cy.wait('@resetTwoFactorAuth');
            cy.findByText(resetWarningMessage);
            // Type a valid token, confirm that 2fa is enabled and scratch code is shown.
            (0, profile_1.mockConfirmTwoFactorAuth)(mockedScratchCode).as('confirmResetTwoFactorAuth');
            (0, profile_1.mockGetProfile)(userProfileTwoFactorEnabled).as('getProfileTwoFactorEnabled');
            cy.findByLabelText('Token').should('be.visible').type(validToken);
            ui_1.ui.button
                .findByTitle('Confirm Token')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@confirmResetTwoFactorAuth');
        cy.wait('@getProfileTwoFactorEnabled');
        // Confirm that scratch code is shown, close dialog.
        ui_1.ui.dialog
            .findByTitle('Scratch Code')
            .should('be.visible')
            .within(function () {
            cy.findByText(mockedScratchCode).should('be.visible');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Got it')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that two-factor authentication is reset.
        getTwoFactorSection().within(function () {
            // The 2FA enable message appears after reset, not a reset-specific message.
            cy.findByText(enabledMessage).should('be.visible');
            ui_1.ui.toggle
                .find()
                .should('have.attr', 'data-qa-toggle', 'true')
                .should('be.visible');
        });
    });
    /**
     * - Confirms that user cannot enable 2FA when security questions are unanswered.
     * - Confirms that warning message is shown explaining why 2FA cannot be enabled.
     */
    it('cannot enable two factor auth without security questions', function () {
        (0, profile_1.mockGetProfile)(userProfile).as('getProfile');
        (0, profile_1.mockGetSecurityQuestions)(getUnansweredSecurityQuestions()).as('getSecurityQuestions');
        cy.visitWithLogin('/profile/auth');
        cy.wait('@getProfile');
        cy.wait('@getSecurityQuestions');
        getTwoFactorSection().within(function () {
            cy.findByText(securityQuestionsMessage).should('be.visible');
            // Confirm that the usual 2FA enable/disable/reset controls are not present.
            cy.contains('Enabled').should('not.exist');
            cy.contains('Disabled').should('not.exist');
            cy.contains('Reset two-factor authentication').should('not.exist');
        });
    });
});
