"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var creditCardExpiredBannerNotice = 'Your credit card has expired! Please update your payment details.';
describe('Credit Card Expired Banner', function () {
    beforeEach(function () {
        (0, profile_1.mockGetUserPreferences)({ dismissed_notifications: {} });
    });
    it('appears when the expiration date is in the past', function () {
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ credit_card: { expiry: '01/2000' } })).as('getAccount');
        cy.visitWithLogin('/');
        cy.wait('@getAccount');
        cy.findByText(creditCardExpiredBannerNotice).should('be.visible');
        ui_1.ui.button.findByTitle('Update Card').should('be.visible').click();
        // clicking on the link navigates to /account/billing
        cy.url().should('endWith', '/account/billing');
    });
    it('does not appear when the expiration date is in the future', function () {
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ credit_card: { expiry: '01/2999' } })).as('getAccount');
        cy.visitWithLogin('/account/billing');
        cy.wait('@getAccount');
        cy.findByText('Payment Methods').should('be.visible');
        cy.findByText(creditCardExpiredBannerNotice).should('not.exist');
    });
});
