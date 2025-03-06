"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var accountUsers_1 = require("@src/factories/accountUsers");
var grants_1 = require("@src/factories/grants");
var user_1 = require("support/constants/user");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var profile_2 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
describe('User verification banner', function () {
    /*
     * - Confirms that a banner is present when child users do not have a phone number or security questions.
     * - Confirms that the "Add Verification Details" button redirects the user to /profile/auth.
     */
    it('can show up when a child user has not associated a phone number or set up security questions for their account', function () {
        var mockChildProfile = factories_1.profileFactory.build({
            user_type: 'child',
            username: 'child-user',
            verified_phone_number: null,
        });
        var mockChildUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            user_type: 'child',
            username: 'child-user',
            verified_phone_number: null,
        });
        var mockRestrictedProxyUser = accountUsers_1.accountUserFactory.build({
            restricted: true,
            user_type: 'proxy',
            username: 'restricted-proxy-user',
            verified_phone_number: null,
        });
        var mockUserGrants = grants_1.grantsFactory.build({
            global: { account_access: 'read_write' },
        });
        (0, account_1.mockGetUsers)([mockRestrictedProxyUser]);
        (0, account_1.mockGetUser)(mockChildUser);
        (0, account_1.mockGetUserGrants)(mockChildUser.username, mockUserGrants);
        (0, profile_2.mockGetProfile)(mockChildProfile);
        (0, account_1.mockGetUser)(mockRestrictedProxyUser);
        (0, account_1.mockGetUserGrants)(mockRestrictedProxyUser.username, mockUserGrants);
        // Navigate to Users & Grants page.
        cy.visitWithLogin('/account/users');
        // A banner is displayed and prompts users to set up phone numbers or security questions.
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        // The banner should be present across all other pages
        cy.visitWithLogin('/account/billings');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        cy.visitWithLogin('/account/login-history');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        cy.visitWithLogin('/account/service-transfers');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        cy.visitWithLogin('/account/maintenance');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        cy.visitWithLogin('/account/settings');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        // "Add verification details" button should redirect to url '/profile/auth'
        ui_1.ui.button
            .findByTitle('Add verification details')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', "/profile/auth");
    });
    /*
     * - Confirms that a banner is present when child users set up security questions but not a phone number.
     * - Confirms that the "Add Verification Details" button redirects the user to /profile/auth.
     */
    it('can show up when a child user has set up security questions but not a phone number for their account', function () {
        var mockChildProfile = factories_1.profileFactory.build({
            user_type: 'child',
            username: 'child-user',
            verified_phone_number: null,
        });
        var mockChildUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            user_type: 'child',
            username: 'child-user',
            verified_phone_number: null,
        });
        var mockRestrictedProxyUser = accountUsers_1.accountUserFactory.build({
            restricted: true,
            user_type: 'proxy',
            username: 'restricted-proxy-user',
            verified_phone_number: null,
        });
        var mockUserGrants = grants_1.grantsFactory.build({
            global: { account_access: 'read_write' },
        });
        var mockSecurityQuestions = factories_1.securityQuestionsFactory.build();
        var mockSecurityQuestionAnswers = ['Answer 1', 'Answer 2', 'Answer 3'];
        mockSecurityQuestions.security_questions[0].response =
            mockSecurityQuestionAnswers[0];
        mockSecurityQuestions.security_questions[1].response =
            mockSecurityQuestionAnswers[1];
        mockSecurityQuestions.security_questions[2].response =
            mockSecurityQuestionAnswers[2];
        (0, account_1.mockGetUsers)([mockRestrictedProxyUser]).as('getUsers');
        (0, account_1.mockGetUser)(mockChildUser);
        (0, account_1.mockGetUserGrants)(mockChildUser.username, mockUserGrants);
        (0, profile_2.mockGetProfile)(mockChildProfile);
        (0, account_1.mockGetUser)(mockRestrictedProxyUser);
        (0, account_1.mockGetUserGrants)(mockRestrictedProxyUser.username, mockUserGrants);
        (0, profile_1.mockGetSecurityQuestions)(mockSecurityQuestions).as('getSecurityQuestions');
        // Navigate to Users & Grants page.
        cy.visitWithLogin('/account/users');
        cy.wait(['@getUsers', '@getSecurityQuestions']);
        // A banner is displayed and prompts users to set up phone numbers or security questions.
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        // The banner should be present across all other pages
        cy.visitWithLogin('/account/billings');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        cy.visitWithLogin('/account/login-history');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        cy.visitWithLogin('/account/service-transfers');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        cy.visitWithLogin('/account/maintenance');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        cy.visitWithLogin('/account/settings');
        cy.findByText(user_1.verificationBannerNotice).should('be.visible');
        // "Add verification details" button should redirect to url '/profile/auth'
        ui_1.ui.button
            .findByTitle('Add verification details')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', "/profile/auth");
    });
    /*
     * - Confirms that a banner is not shown when the child user sets up both phone number and security questions.
     */
    it('does not show up when a child user adds a phone number and sets up security questions', function () {
        var mockChildProfile = factories_1.profileFactory.build({
            user_type: 'child',
            username: 'child-user',
            verified_phone_number: '+15555555555',
        });
        var mockChildUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            user_type: 'child',
            username: 'child-user',
            verified_phone_number: '+15555555555',
        });
        var mockRestrictedProxyUser = accountUsers_1.accountUserFactory.build({
            restricted: true,
            user_type: 'proxy',
            username: 'restricted-proxy-user',
            verified_phone_number: '+15555555555',
        });
        var mockUserGrants = grants_1.grantsFactory.build({
            global: { account_access: 'read_write' },
        });
        var mockSecurityQuestions = factories_1.securityQuestionsFactory.build();
        var mockSecurityQuestionAnswers = ['Answer 1', 'Answer 2', 'Answer 3'];
        mockSecurityQuestions.security_questions[0].response =
            mockSecurityQuestionAnswers[0];
        mockSecurityQuestions.security_questions[1].response =
            mockSecurityQuestionAnswers[1];
        mockSecurityQuestions.security_questions[2].response =
            mockSecurityQuestionAnswers[2];
        (0, account_1.mockGetUsers)([mockRestrictedProxyUser]).as('getUsers');
        (0, account_1.mockGetUser)(mockChildUser);
        (0, account_1.mockGetUserGrants)(mockChildUser.username, mockUserGrants);
        (0, profile_2.mockGetProfile)(mockChildProfile);
        (0, account_1.mockGetUser)(mockRestrictedProxyUser);
        (0, account_1.mockGetUserGrants)(mockRestrictedProxyUser.username, mockUserGrants);
        (0, profile_1.mockGetSecurityQuestions)(mockSecurityQuestions).as('getSecurityQuestions');
        // Navigate to Users & Grants page and confirm "Partner user settings" and "User settings" sections are visible.
        cy.visitWithLogin('/account/users');
        cy.wait(['@getUsers', '@getSecurityQuestions']);
        // The banner should not show up.
        cy.findByText(user_1.verificationBannerNotice).should('not.exist');
        cy.get('[data-testid="confirmButton"]').should('not.exist');
    });
});
