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
var events_1 = require("support/intercepts/events");
var general_1 = require("support/intercepts/general");
var linodes_1 = require("support/intercepts/linodes");
var profile_1 = require("support/intercepts/profile");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var local_storage_1 = require("support/util/local-storage");
var random_1 = require("support/util/random");
var grants_1 = require("@src/factories/grants");
/**
 * Confirms expected username and company name are shown in user menu button and yields the button.
 *
 * @param username - Username to expect in user menu button.
 * @param companyName - Company name to expect in user menu button.
 *
 * @returns Cypress chainable that yields the user menu button.
 */
var assertUserMenuButton = function (username, companyName) {
    return ui_1.ui.userMenuButton
        .find()
        .should('be.visible')
        .within(function () {
        cy.findByText(username).should('be.visible');
        cy.findByText(companyName).should('be.visible');
    });
};
/**
 * Confirms that expected authentication values are set in Local Storage.
 *
 * @param token - Authentication token value to assert.
 * @param expiry - Authentication expiry value to assert.
 * @param scopes - Authentication scope value to assert.
 */
var assertAuthLocalStorage = function (token, expiry, scopes) {
    (0, local_storage_1.assertLocalStorageValue)('authentication/token', "Bearer ".concat(token));
    (0, local_storage_1.assertLocalStorageValue)('authentication/expire', expiry);
    (0, local_storage_1.assertLocalStorageValue)('authentication/scopes', scopes);
};
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
// Used for testing flows involving multiple children (e.g. switching child -> child).
var mockAlternateChildAccount = factories_1.accountFactory.build({
    company: 'Other Partner Company',
});
var mockChildAccountProxyUser = accountUsers_1.accountUserFactory.build({
    username: mockParentProfile.username,
    user_type: 'proxy',
});
// Used for testing flows involving multiple children (e.g. switching child -> child).
var mockAlternateChildAccountProxyUser = accountUsers_1.accountUserFactory.build({
    username: mockParentProfile.username,
    user_type: 'proxy',
});
var mockChildAccountProfile = factories_1.profileFactory.build({
    username: mockChildAccountProxyUser.username,
    user_type: 'proxy',
});
// Used for testing flows involving multiple children (e.g. switching child -> child).
var mockAlternateChildAccountProfile = factories_1.profileFactory.build({
    username: mockAlternateChildAccountProxyUser.username,
    user_type: 'proxy',
});
var childAccountAccessGrantEnabled = grants_1.grantsFactory.build({
    global: { account_access: 'read_only', child_account_access: true },
});
var childAccountAccessGrantDisabled = grants_1.grantsFactory.build({
    global: { account_access: 'read_only', child_account_access: false },
});
var mockChildAccountToken = factories_1.appTokenFactory.build({
    id: (0, random_1.randomNumber)(),
    created: luxon_1.DateTime.now().toISO(),
    expiry: luxon_1.DateTime.now().plus({ minutes: 15 }).toISO(),
    label: "".concat(mockChildAccount.company, "_proxy"),
    scopes: '*',
    token: (0, random_1.randomString)(32),
    website: undefined,
    thumbnail_url: undefined,
});
// Used for testing flows involving multiple children (e.g. switching child -> child).
var mockAlternateChildAccountToken = factories_1.appTokenFactory.build({
    id: (0, random_1.randomNumber)(),
    created: luxon_1.DateTime.now().toISO(),
    expiry: luxon_1.DateTime.now().plus({ minutes: 15 }).toISO(),
    label: "".concat(mockAlternateChildAccount.company, "_proxy"),
    scopes: '*',
    token: (0, random_1.randomString)(32),
    website: undefined,
    thumbnail_url: undefined,
});
var mockErrorMessage = 'An unknown error has occurred.';
describe('Parent/Child account switching', function () {
    /*
     * Tests to confirm that Parent account users can switch to Child accounts as expected.
     */
    describe('From Parent to Child', function () {
        /*
         * - Confirms that Parent account user can switch to Child account from Account Billing page.
         * - Confirms that Child account information is displayed in user menu button after switch.
         * - Confirms that Cloud updates local storage auth values upon account switch.
         */
        it('can switch from Parent account user to Proxy account user from Billing page', function () {
            (0, profile_1.mockGetProfile)(mockParentProfile);
            (0, account_1.mockGetAccount)(mockParentAccount);
            (0, account_1.mockGetChildAccounts)([mockChildAccount]);
            (0, account_1.mockGetUser)(mockParentUser);
            (0, account_1.interceptGetPayments)().as('getPayments');
            (0, account_1.interceptGetPaymentMethods)().as('getPaymentMethods');
            (0, account_1.interceptGetInvoices)().as('getInvoices');
            cy.visitWithLogin('/account/billing');
            cy.trackPageVisit().as('pageVisit');
            cy.wait(['@getPayments', '@getInvoices', '@getPaymentMethods']);
            // Confirm that "Switch Account" button is present, then click it.
            ui_1.ui.button
                .findByTitle('Switch Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Prepare up mocks in advance of the account switch. As soon as the child account is clicked,
            // Cloud will replace its stored token with the token provided by the API and then reload.
            // From that point forward, we will not have a valid test account token stored in local storage,
            // so all non-intercepted API requests will respond with a 401 status code and we will get booted to login.
            // We'll mitigate this by broadly mocking ALL API-v4 requests, then applying more specific mocks to the
            // individual requests as needed.
            (0, general_1.mockAllApiRequests)();
            (0, linodes_1.mockGetLinodes)([]);
            (0, regions_1.mockGetRegions)([]);
            (0, events_1.mockGetEvents)([]);
            (0, events_1.mockGetNotifications)([]);
            (0, account_1.mockGetAccount)(mockChildAccount);
            (0, profile_1.mockGetProfile)(mockChildAccountProfile);
            (0, account_1.mockGetUser)(mockChildAccountProxyUser);
            (0, account_1.mockGetPaymentMethods)(factories_1.paymentMethodFactory.buildList(1));
            (0, account_1.mockGetInvoices)([]);
            (0, account_1.mockGetPayments)([]);
            // Mock the account switch itself -- we have to do this after the mocks above
            // to ensure that it is applied.
            (0, account_1.mockCreateChildAccountToken)(mockChildAccount, mockChildAccountToken).as('switchAccount');
            ui_1.ui.drawer
                .findByTitle('Switch Account')
                .should('be.visible')
                .within(function () {
                cy.findByText(mockChildAccount.company).should('be.visible').click();
            });
            cy.wait('@switchAccount');
            cy.expectNewPageVisit('@pageVisit');
            // Confirm that Cloud Manager updates local storage authentication values.
            // Satisfy TypeScript using non-null assertions since we know what the mock data contains.
            assertAuthLocalStorage(mockChildAccountToken.token, mockChildAccountToken.expiry, mockChildAccountToken.scopes);
            // Confirm expected username and company are shown in user menu button.
            assertUserMenuButton(mockChildAccountProxyUser.username, mockChildAccount.company);
            ui_1.ui.toast.assertMessage("Account switched to ".concat(mockChildAccount.company, "."));
        });
        /*
         * - Confirms that Parent account user can switch to Child account using the user menu.
         * - Confirms that Parent account information is initially displayed in user menu button.
         * - Confirms that Child account information is displayed in user menu button after switch.
         * - Confirms that Cloud updates local storage auth values upon account switch.
         */
        it('can switch from Parent account user to Proxy account user using user menu', function () {
            (0, profile_1.mockGetProfile)(mockParentProfile);
            (0, account_1.mockGetAccount)(mockParentAccount);
            (0, account_1.mockGetChildAccounts)([mockChildAccount]);
            (0, account_1.mockGetUser)(mockParentUser);
            cy.visitWithLogin('/');
            cy.trackPageVisit().as('pageVisit');
            // Confirm that Parent account username and company name are shown in user
            // menu button, then click the button.
            assertUserMenuButton(mockParentProfile.username, mockParentAccount.company).click();
            // Click "Switch Account" button in user menu.
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
            // Prepare up mocks in advance of the account switch. As soon as the child account is clicked,
            // Cloud will replace its stored token with the token provided by the API and then reload.
            // From that point forward, we will not have a valid test account token stored in local storage,
            // so all non-intercepted API requests will respond with a 401 status code and we will get booted to login.
            // We'll mitigate this by broadly mocking ALL API-v4 requests, then applying more specific mocks to the
            // individual requests as needed.
            (0, general_1.mockAllApiRequests)();
            (0, linodes_1.mockGetLinodes)([]);
            (0, regions_1.mockGetRegions)([]);
            (0, events_1.mockGetEvents)([]);
            (0, events_1.mockGetNotifications)([]);
            (0, account_1.mockGetAccount)(mockChildAccount);
            (0, profile_1.mockGetProfile)(mockChildAccountProfile);
            (0, account_1.mockGetUser)(mockChildAccountProxyUser);
            // Click mock company name in "Switch Account" drawer.
            (0, account_1.mockCreateChildAccountToken)(mockChildAccount, mockChildAccountToken).as('switchAccount');
            ui_1.ui.drawer
                .findByTitle('Switch Account')
                .should('be.visible')
                .within(function () {
                cy.findByText(mockChildAccount.company).should('be.visible').click();
            });
            cy.wait('@switchAccount');
            cy.expectNewPageVisit('@pageVisit');
            // Confirm that Cloud Manager updates local storage authentication values.
            // Satisfy TypeScript using non-null assertions since we know what the mock data contains.
            assertAuthLocalStorage(mockChildAccountToken.token, mockChildAccountToken.expiry, mockChildAccountToken.scopes);
            // Confirm expected username and company are shown in user menu button.
            assertUserMenuButton(mockParentProfile.username, mockChildAccount.company);
        });
        /*
         * - Confirms search functionality in the account switching drawer.
         */
        it('can search child accounts', function () {
            (0, profile_1.mockGetProfile)(mockParentProfile);
            (0, account_1.mockGetAccount)(mockParentAccount);
            (0, account_1.mockGetChildAccounts)([mockChildAccount, mockAlternateChildAccount]);
            (0, account_1.mockGetUser)(mockParentUser);
            cy.visitWithLogin('/');
            cy.trackPageVisit().as('pageVisit');
            // Confirm that Parent account username and company name are shown in user
            // menu button, then click the button.
            assertUserMenuButton(mockParentProfile.username, mockParentAccount.company).click();
            // Click "Switch Account" button in user menu.
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
            // Confirm search functionality.
            ui_1.ui.drawer
                .findByTitle('Switch Account')
                .should('be.visible')
                .within(function () {
                // Confirm all child accounts are displayed when drawer loads.
                cy.findByText(mockChildAccount.company).should('be.visible');
                cy.findByText(mockAlternateChildAccount.company).should('be.visible');
                // Confirm no results message.
                (0, account_1.mockGetChildAccounts)([]).as('getEmptySearchResults');
                cy.findByPlaceholderText('Search').click();
                cy.focused().type('Fake Name');
                cy.wait('@getEmptySearchResults');
                cy.contains(mockChildAccount.company).should('not.exist');
                cy.findByText('There are no child accounts that match this query.').should('be.visible');
                // Confirm filtering by company name displays only one search result.
                (0, account_1.mockGetChildAccounts)([mockChildAccount]).as('getSearchResults');
                cy.findByPlaceholderText('Search').click();
                cy.focused().clear();
                cy.focused().type(mockChildAccount.company);
                cy.wait('@getSearchResults');
                cy.findByText(mockChildAccount.company).should('be.visible');
                cy.contains(mockAlternateChildAccount.company).should('not.exist');
                cy.contains('There are no child accounts that match this query.').should('not.exist');
            });
        });
    });
    /**
     * Tests to confirm that Parent account users can switch back from Child accounts as expected.
     */
    describe('From Child to Parent', function () {
        /*
         * - Confirms that a Child account Proxy user can switch back to a Parent account from Billing page.
         * - Confirms that Parent account information is displayed in user menu button after switch.
         * - Confirms that Cloud updates local storage auth values upon account switch.
         */
        it('can switch from Proxy user back to Parent account user from Billing page', function () {
            var mockParentToken = (0, random_1.randomString)(32);
            var mockParentExpiration = luxon_1.DateTime.now().plus({ minutes: 15 }).toISO();
            (0, account_1.mockGetAccount)(mockChildAccount);
            (0, profile_1.mockGetProfile)(mockChildAccountProfile);
            (0, account_1.mockGetChildAccounts)([]);
            (0, account_1.mockGetUser)(mockChildAccountProxyUser);
            (0, account_1.interceptGetPayments)().as('getPayments');
            (0, account_1.interceptGetPaymentMethods)().as('getPaymentMethods');
            (0, account_1.interceptGetInvoices)().as('getInvoices');
            // Visit billing page with `authentication/parent_token/*` local storage
            // data set to mock values.
            cy.visitWithLogin('/account/billing', {
                localStorageOverrides: {
                    proxy_user: true,
                    'authentication/parent_token/token': "Bearer ".concat(mockParentToken),
                    'authentication/parent_token/expire': mockParentExpiration,
                    'authentication/parent_token/scopes': '*',
                },
            });
            // Track the initial page visit so that we can later assert that Cloud has
            // reloaded upon switching accounts.
            cy.trackPageVisit().as('pageVisit');
            // Wait for page to finish loading before proceeding with account switch.
            cy.wait(['@getPayments', '@getPaymentMethods', '@getInvoices']);
            ui_1.ui.button
                .findByTitle('Switch Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Prepare mocks in advance of the account switch. As soon as the switch back link is clicked,
            // Cloud will replace its stored token with the token provided by the API and then reload.
            // From that point forward, we will not have a valid test account token stored in local storage,
            // so all non-intercepted API requests will respond with a 401 status code and we will get booted to login.
            // We'll mitigate this by broadly mocking ALL API-v4 requests, then applying more specific mocks to the
            // individual requests as needed.
            (0, general_1.mockAllApiRequests)();
            (0, linodes_1.mockGetLinodes)([]);
            (0, regions_1.mockGetRegions)([]);
            (0, events_1.mockGetEvents)([]);
            (0, events_1.mockGetNotifications)([]);
            (0, account_1.mockGetAccount)(mockParentAccount);
            (0, profile_1.mockGetProfile)(mockParentProfile);
            (0, account_1.mockGetUser)(mockParentUser);
            (0, account_1.mockGetPaymentMethods)(factories_1.paymentMethodFactory.buildList(1)).as('getPaymentMethods');
            (0, account_1.mockGetInvoices)([]).as('getInvoices');
            (0, account_1.mockGetPayments)([]).as('getPayments');
            ui_1.ui.drawer
                .findByTitle('Switch Account')
                .should('be.visible')
                .within(function () {
                cy.findByText('There are no child accounts.').should('be.visible');
                cy.findByText('switch back to your account')
                    .should('be.visible')
                    .click();
            });
            cy.expectNewPageVisit('@pageVisit');
            cy.wait(['@getInvoices', '@getPayments', '@getPaymentMethods']);
            assertAuthLocalStorage(mockParentToken, mockParentExpiration, '*');
            assertUserMenuButton(mockParentProfile.username, mockParentAccount.company);
        });
    });
    /**
     * Tests to confirm that Proxy users can switch to other Child accounts as expected.
     */
    describe('From Child to Child', function () {
        /*
         * - Confirms that a Child account Proxy user can switch to another Child account from Billing page.
         * - Confirms that alternate Child account information is displayed in user menu button after switch.
         * - Confirms that Cloud updates local storage auth values upon account switch.
         */
        it('can switch to another Child account as a Proxy user', function () {
            var mockParentToken = (0, random_1.randomString)(32);
            var mockParentExpiration = luxon_1.DateTime.now().plus({ minutes: 15 }).toISO();
            (0, account_1.mockGetAccount)(mockChildAccount);
            (0, profile_1.mockGetProfile)(mockChildAccountProfile);
            (0, account_1.mockGetChildAccounts)([mockAlternateChildAccount]);
            (0, account_1.mockGetUser)(mockChildAccountProxyUser);
            (0, account_1.interceptGetPayments)().as('getPayments');
            (0, account_1.interceptGetPaymentMethods)().as('getPaymentMethods');
            (0, account_1.interceptGetInvoices)().as('getInvoices');
            // Visit billing page with `authentication/parent_token/*` local storage
            // data set to mock values.
            cy.visitWithLogin('/account/billing', {
                localStorageOverrides: {
                    proxy_user: true,
                    'authentication/parent_token/token': "Bearer ".concat(mockParentToken),
                    'authentication/parent_token/expire': mockParentExpiration,
                    'authentication/parent_token/scopes': '*',
                },
            });
            cy.trackPageVisit().as('pageVisit');
            // Wait for page to finish loading before proceeding with account switch.
            cy.wait(['@getPayments', '@getPaymentMethods', '@getInvoices']);
            ui_1.ui.button
                .findByTitle('Switch Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Prepare mocks in advance of the account switch. As soon as the child account is clicked,
            // Cloud will replace its stored token with the token provided by the API and then reload.
            // From that point forward, we will not have a valid test account token stored in local storage,
            // so all non-intercepted API requests will respond with a 401 status code and we will get booted to login.
            // We'll mitigate this by broadly mocking ALL API-v4 requests, then applying more specific mocks to the
            // individual requests as needed.
            (0, general_1.mockAllApiRequests)();
            (0, linodes_1.mockGetLinodes)([]);
            (0, regions_1.mockGetRegions)([]);
            (0, events_1.mockGetEvents)([]);
            (0, events_1.mockGetNotifications)([]);
            (0, account_1.mockGetAccount)(mockAlternateChildAccount);
            (0, profile_1.mockGetProfile)(mockAlternateChildAccountProfile);
            (0, account_1.mockGetUser)(mockAlternateChildAccountProxyUser);
            (0, account_1.mockGetPaymentMethods)(factories_1.paymentMethodFactory.buildList(1)).as('getPaymentMethods');
            (0, account_1.mockGetInvoices)([]).as('getInvoices');
            (0, account_1.mockGetPayments)([]).as('getPayments');
            // Set up account switch mock.
            (0, account_1.mockCreateChildAccountToken)(mockAlternateChildAccount, mockAlternateChildAccountToken).as('switchAccount');
            // Click mock company name in "Switch Account" drawer.
            ui_1.ui.drawer
                .findByTitle('Switch Account')
                .should('be.visible')
                .within(function () {
                cy.findByText(mockAlternateChildAccount.company)
                    .should('be.visible')
                    .click();
            });
            // Allow page to load before asserting user menu, ensuring no app crash, etc.
            cy.wait('@switchAccount');
            cy.expectNewPageVisit('@pageVisit');
            cy.wait(['@getInvoices', '@getPayments', '@getPaymentMethods']);
            assertUserMenuButton(mockAlternateChildAccountProfile.username, mockAlternateChildAccount.company);
            assertAuthLocalStorage(mockAlternateChildAccountToken.token, mockAlternateChildAccountToken.expiry, mockAlternateChildAccountToken.scopes);
            // TODO Confirm whether toast is intended here.
            // ui.toast.assertMessage(
            //   `Account switched to ${mockAlternateChildAccount.company}.`
            // );
        });
    });
    describe('Child Account Access', function () {
        /*
         * - Smoke test to confirm that restricted parent users with the child_account_access grant can switch accounts.
         * - Confirms that the "Switch Account" button is rendered.
         */
        describe('Enabled', function () {
            it('renders "Switch Account" button for restricted users on Billing page', function () {
                (0, profile_1.mockGetProfile)(__assign(__assign({}, mockParentProfile), { restricted: true }));
                (0, account_1.mockGetUser)(mockParentUser);
                (0, profile_1.mockGetProfileGrants)(childAccountAccessGrantEnabled);
                cy.visitWithLogin('/account/billing');
                cy.findByTestId('switch-account-button').should('be.visible');
            });
            it('renders "Switch Account" button for restricted users in user menu', function () {
                (0, profile_1.mockGetProfile)(__assign(__assign({}, mockParentProfile), { restricted: true }));
                (0, account_1.mockGetAccount)(mockParentAccount);
                (0, account_1.mockGetUser)(mockParentUser);
                (0, profile_1.mockGetProfileGrants)(childAccountAccessGrantEnabled);
                cy.visitWithLogin('/');
                assertUserMenuButton(mockParentProfile.username, mockParentAccount.company).click();
                ui_1.ui.userMenu
                    .find()
                    .should('be.visible')
                    .within(function () {
                    cy.findByTestId('switch-account-button').should('be.visible');
                });
            });
        });
        /*
         * - Smoke test to confirm that restricted parent users without the child_account_access grant cannot switch accounts.
         * - Confirms that the "Switch Account" button is not rendered.
         */
        describe('Disabled', function () {
            it('does not render "Switch Account" button for restricted users on Billing page', function () {
                (0, profile_1.mockGetProfile)(__assign(__assign({}, mockParentProfile), { restricted: true }));
                (0, account_1.mockGetUser)(mockParentUser);
                (0, profile_1.mockGetProfileGrants)(childAccountAccessGrantDisabled);
                cy.visitWithLogin('/account/billing');
                cy.findByTestId('switch-account-button').should('not.exist');
            });
            it('does not render "Switch Account" button for restricted users in user menu', function () {
                (0, profile_1.mockGetProfile)(__assign(__assign({}, mockParentProfile), { restricted: true }));
                (0, account_1.mockGetAccount)(mockParentAccount);
                (0, account_1.mockGetUser)(mockParentUser);
                (0, profile_1.mockGetProfileGrants)(childAccountAccessGrantDisabled);
                cy.visitWithLogin('/');
                assertUserMenuButton(mockParentProfile.username, mockParentAccount.company).click();
                ui_1.ui.userMenu
                    .find()
                    .should('be.visible')
                    .within(function () {
                    cy.findByTestId('switch-account-button').should('not.exist');
                });
            });
        });
    });
    /*
     * Tests to confirm that Cloud handles account switching errors gracefully.
     */
    describe('Error flows', function () {
        /*
         * - Confirms error handling upon failure to fetch child accounts.
         * - Confirms "Try Again" button can be used to re-fetch child accounts successfully.
         * - Confirms error handling upon failure to create child account token.
         */
        it('handles account switching API errors', function () {
            (0, profile_1.mockGetProfile)(mockParentProfile);
            (0, account_1.mockGetAccount)(mockParentAccount);
            (0, account_1.mockGetChildAccountsError)('An unknown error has occurred', 500);
            (0, account_1.mockGetUser)(mockParentUser);
            cy.visitWithLogin('/account/billing');
            ui_1.ui.button
                .findByTitle('Switch Account')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle('Switch Account')
                .should('be.visible')
                .within(function () {
                // Confirm error message upon failure to fetch child accounts.
                cy.findByText('Unable to load data.').should('be.visible');
                cy.findByText('Try again or contact support if the issue persists.').should('be.visible');
                // Click "Try Again" button and mock a successful response.
                (0, account_1.mockGetChildAccounts)([mockChildAccount]);
                ui_1.ui.button
                    .findByTitle('Try again')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // Click child company and mock an error.
                // Confirm that Cloud Manager displays the error message in the drawer.
                (0, account_1.mockCreateChildAccountTokenError)(mockChildAccount, mockErrorMessage);
                cy.findByText(mockChildAccount.company).click();
                cy.findByText(mockErrorMessage).should('be.visible');
            });
        });
    });
});
