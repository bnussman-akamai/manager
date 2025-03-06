"use strict";
/**
 * @file Integration tests for Cloud Manager account login history flows.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/constants/account");
var account_2 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var factories_1 = require("src/factories");
var accountLogin_1 = require("src/factories/accountLogin");
var constants_1 = require("src/features/Account/constants");
var formatDate_1 = require("src/utilities/formatDate");
describe('Account login history', function () {
    /*
     * - Confirms that a user can navigate to and view the login history page.
     * - Confirms that login table displays the expected column headers.
     * - Confirms that the login table displays a mocked failed restricted user login.
     * - Confirm that the login table displays a mocked successful unrestricted user login.
     */
    it('users can view the login history table', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: false,
            user_type: 'default',
            username: 'mock-user',
        });
        var mockFailedLogin = accountLogin_1.accountLoginFactory.build({
            restricted: true,
            status: 'failed',
            username: 'mock-restricted-user',
        });
        var mockSuccessfulLogin = accountLogin_1.accountLoginFactory.build({
            restricted: false,
            status: 'successful',
        });
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        (0, account_2.mockGetAccountLogins)([mockFailedLogin, mockSuccessfulLogin]).as('getAccountLogins');
        // Navigate to Account Login History page.
        cy.visitWithLogin('/account/login-history');
        cy.wait(['@getProfile']);
        // Confirm helper text above table is visible.
        cy.findByText(account_1.loginHelperText).should('be.visible');
        // Confirm the login table includes the expected column headers and mocked logins are visible in table.
        cy.findByLabelText('Account Logins').within(function () {
            cy.get('thead').findByText('Date').should('be.visible');
            cy.get('thead').findByText('Username').should('be.visible');
            cy.get('thead').findByText('IP').should('be.visible');
            cy.get('thead').findByText('Permission Level').should('be.visible');
            cy.get('thead').findByText('Access').should('be.visible');
            // Confirm that restricted user's failed login and status icon display in table.
            cy.findByText(mockFailedLogin.username)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText(mockFailedLogin.status, { exact: false }).should('be.visible');
                cy.findAllByLabelText("Status is ".concat(mockFailedLogin.status));
                cy.findByText('Restricted').should('be.visible');
            });
            // Confirm that unrestricted user login displays in table.
            cy.findByText(mockSuccessfulLogin.username)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                // Confirm that successful login and status icon display in table.
                cy.findAllByLabelText("Status is ".concat(mockSuccessfulLogin.status));
                // Confirm all other fields display in table.
                cy.findByText((0, formatDate_1.formatDate)(mockSuccessfulLogin.datetime, {
                    timezone: mockProfile.timezone,
                })).should('be.visible');
                cy.findByText(mockSuccessfulLogin.ip).should('be.visible');
                cy.findByText('Unrestricted').should('be.visible');
            });
        });
    });
    /**
     * - Confirms that a child user can navigate to the Login History page.
     * - Confirms that a restricted child user cannot see login history data.
     * - Confirms that a child user sees a notice instead.
     */
    it('restricted child users cannot view login history', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: true,
            user_type: 'child',
            username: 'mock-child-user',
        });
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        // Navigate to Account Login History page.
        cy.visitWithLogin('/account/login-history');
        cy.wait(['@getProfile']);
        // Confirm helper text above table and table are not visible.
        cy.findByText(account_1.loginHelperText).should('not.exist');
        cy.findByLabelText('Account Logins').should('not.exist');
        cy.findByText("You don't have permissions to edit this Account. Please contact your ".concat(constants_1.PARENT_USER, " to request the necessary permissions."));
    });
    /**
     * - Confirms that a child user can navigate to the Login History page.
     * - Confirms that a unrestricted child user can see login history data.
     */
    it('unrestricted child users can view login history', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: false,
            user_type: 'child',
            username: 'mock-child-user',
        });
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        // Navigate to Account Login History page.
        cy.visitWithLogin('/account/login-history');
        cy.wait(['@getProfile']);
        // Confirm helper text above table and table are not visible.
        cy.findByText(account_1.loginHelperText).should('exist');
        cy.findByLabelText('Account Logins').should('exist');
    });
    /**
     * - Confirms that a restricted user can navigate to the Login History page.
     * - Confirms that a restricted user cannot see login history data.
     * - Confirms that a restricted user sees a notice instead.
     */
    it('restricted users cannot view login history', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: true,
            user_type: 'default',
            username: 'mock-restricted-user',
        });
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        // Navigate to Account Login History page.
        cy.visitWithLogin('/account/login-history');
        cy.wait(['@getProfile']);
        // Confirm helper text above table and table are not visible.
        cy.findByText(account_1.loginHelperText).should('not.exist');
        cy.findByLabelText('Account Logins').should('not.exist');
        cy.findByText("You don't have permissions to edit this Account. Please contact your account administrator to request the necessary permissions.");
    });
    /*
     * - Vaildates login history landing page with mock data.
     * - Confirms that each login is listed in the Login History table.
     * - Confirms that "Successful" indicator is shown for successful login attempts, and the "Failure" indicator is shown for the failed ones.
     * - Confirms that clicking on the username for the login navigates to the expected user page
     */
    it('shows each login in the Login History landing page as expected', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: false,
            user_type: 'default',
            username: 'mock-user',
        });
        var mockFailedLogin = accountLogin_1.accountLoginFactory.build({
            restricted: false,
            status: 'failed',
            username: 'mock-user-failed',
        });
        var mockSuccessfulLogin = accountLogin_1.accountLoginFactory.build({
            restricted: false,
            status: 'successful',
            username: 'mock-user-successful',
        });
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        (0, account_2.mockGetAccountLogins)([mockFailedLogin, mockSuccessfulLogin]).as('getAccountLogins');
        // Navigate to Account Login History page.
        cy.visitWithLogin('/account/login-history');
        cy.wait(['@getProfile']);
        // Confirm helper text above table is visible.
        cy.findByText(account_1.loginHelperText).should('be.visible');
        // Confirm the login table includes the expected column headers and mocked logins are visible in table.
        cy.findByLabelText('Account Logins').within(function () {
            cy.get('thead').findByText('Date').should('be.visible');
            cy.get('thead').findByText('Username').should('be.visible');
            cy.get('thead').findByText('IP').should('be.visible');
            cy.get('thead').findByText('Permission Level').should('be.visible');
            cy.get('thead').findByText('Access').should('be.visible');
            // Confirm that restricted user's failed login and status icon display in table.
            cy.findByText(mockFailedLogin.username)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                // cy.findByText(mockFailedLogin.status, { exact: false }).should(
                //   'be.visible'
                // );
                cy.findAllByLabelText("Status is ".concat(mockFailedLogin.status));
                cy.findByText('Unrestricted').should('be.visible');
            });
            // Confirm that unrestricted user login displays in table.
            cy.findByText(mockSuccessfulLogin.username)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                // Confirm that successful login and status icon display in table.
                cy.findAllByLabelText("Status is ".concat(mockSuccessfulLogin.status));
                // Confirm all other fields display in table.
                cy.findByText((0, formatDate_1.formatDate)(mockSuccessfulLogin.datetime, {
                    timezone: mockProfile.timezone,
                })).should('be.visible');
                cy.findByText(mockSuccessfulLogin.ip).should('be.visible');
                cy.findByText('Unrestricted').should('be.visible');
            });
        });
    });
    /*
     * - Confirms that empty state is handled gracefully, showing corresponding message.
     */
    it('shows empty message when there is no login history', function () {
        (0, account_2.mockGetAccountLogins)([]).as('getAccountLogins');
        // Navigate to Login History landing page.
        cy.visitWithLogin('/account/login-history');
        cy.wait('@getAccountLogins');
        // Confirm helper text above table is visible.
        cy.findByText(account_1.loginHelperText).should('be.visible');
        cy.findByLabelText('Account Logins').within(function () {
            cy.get('thead').findByText('Date').should('be.visible');
            cy.get('thead').findByText('Username').should('be.visible');
            cy.get('thead').findByText('IP').should('be.visible');
            cy.get('thead').findByText('Permission Level').should('be.visible');
            cy.get('thead').findByText('Access').should('be.visible');
        });
        cy.get('[data-testid="table-row-empty"]')
            .should('be.visible')
            .within(function () {
            cy.findByText(account_1.loginEmptyStateMessageText).should('be.visible');
        });
    });
});
