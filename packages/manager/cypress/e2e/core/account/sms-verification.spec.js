"use strict";
/**
 * @file Integration tests for SMS phone verification.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var profile_2 = require("src/factories/profile");
var helpers_1 = require("src/features/Profile/AuthenticationSettings/PhoneVerification/helpers");
describe('SMS phone verification', function () {
    /*
     * - Vaildates SMS phone verification opt-in flow using mocked data.
     * - Confirms that user is shown phone verification prompt.
     * - Confirms that user can request OTP to opt into SMS verification.
     * - Confirms UI flow when user enters incorrect OTP.
     * - Confirms UI flow when user clicks "Resend Verification Code".
     * - Confirms UI flow when user enters correct OTP.
     */
    it('can opt into SMS phone verification', function () {
        var optInPhoneNumber = "1115551155";
        var userProfile = profile_2.profileFactory.build({
            uid: (0, random_1.randomNumber)(1000, 9999),
            username: (0, random_1.randomLabel)(),
            verified_phone_number: undefined,
        });
        var verificationNotice = 'By clicking Send Verification Code you are opting in to receive SMS messages.';
        // @TODO Update this to reflect actual API error message.
        var verificationCodeError = 'Invalid verification code.';
        var confirmationMessage = 'SMS verification code was sent to +1 1115551155';
        (0, profile_1.mockGetProfile)(userProfile).as('getProfile');
        (0, profile_1.mockSendVerificationCode)().as('sendVerificationCode');
        (0, profile_1.mockVerifyVerificationCode)(verificationCodeError).as('verifyCode');
        cy.visitWithLogin('/profile/auth');
        cy.wait('@getProfile');
        cy.findByText(verificationNotice, { exact: false }).should('be.visible');
        cy.findByText('You are opted out of SMS messaging.').should('be.visible');
        // @TODO Add steps to change country code before typing phone number.
        cy.findByLabelText('Phone Number').click();
        cy.focused().type(optInPhoneNumber);
        ui_1.ui.button
            .findByTitle('Send Verification Code')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@sendVerificationCode');
        cy.findByText(confirmationMessage, { exact: false }).should('be.visible');
        // Mock invalid verification code for first attempt.
        cy.findByLabelText('Verification Code').should('be.visible').click();
        cy.focused().type("".concat((0, random_1.randomNumber)(10000, 50000)));
        ui_1.ui.button
            .findByTitle('Verify Phone Number')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@verifyCode');
        cy.findByText(verificationCodeError);
        // Resend verification code.
        cy.findByText('Resend verification code').should('be.visible').click();
        cy.wait('@sendVerificationCode');
        ui_1.ui.toast.assertMessage('Successfully resent verification code');
        // Mock successful verification code for second attempt.
        (0, profile_1.mockVerifyVerificationCode)().as('verifyCode');
        cy.findByLabelText('Verification Code').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type("".concat((0, random_1.randomNumber)(10000, 50000)));
        ui_1.ui.button
            .findByTitle('Verify Phone Number')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@verifyCode');
        ui_1.ui.toast.assertMessage('Successfully verified phone number');
        cy.findByText('+1 1115551155').should('be.visible');
        ui_1.ui.button
            .findByTitle('Send Verification Code')
            .should('be.visible')
            .should('be.disabled');
    });
    /*
     * - Validates SMS phone verification opt-out flow using mocked data.
     * - Confirms that user is shown message telling them they are opted in.
     * - Confirms that user can opt out by clicking 'Opt Out'
     * - Confirms that user is then shown message telling them they are opted out.
     */
    it('can opt out of SMS phone verification', function () {
        var userPhoneNumber = (0, random_1.randomPhoneNumber)();
        var formattedPhoneNumber = (0, helpers_1.getFormattedNumber)(userPhoneNumber);
        var userProfile = profile_2.profileFactory.build({
            uid: (0, random_1.randomNumber)(1000, 9999),
            username: (0, random_1.randomLabel)(),
            verified_phone_number: userPhoneNumber,
        });
        var expectedOptInMessage = 'You have opted in to SMS messaging.';
        var expectedOptOutMessage = 'You are opted out of SMS messaging.';
        (0, profile_1.mockGetProfile)(userProfile).as('getProfile');
        (0, profile_1.mockSmsVerificationOptOut)().as('smsOptOut');
        cy.visitWithLogin('/profile/auth');
        cy.wait('@getProfile');
        cy.findByText(expectedOptInMessage).should('be.visible');
        ui_1.ui.button
            .findByTitle('Opt Out')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.dialog
            .findByTitle('Opt out of SMS messaging for phone verification')
            .should('be.visible')
            .within(function () {
            cy.findByText(formattedPhoneNumber, { exact: false }).should('be.visible');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Opt Out')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@smsOptOut');
        cy.findByText(expectedOptOutMessage).should('be.visible');
        ui_1.ui.toast.assertMessage('Successfully opted out of SMS messaging');
    });
});
