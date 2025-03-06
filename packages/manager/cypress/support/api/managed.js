"use strict";
/**
 * @file Util functions and mock data related to Linode Managed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitUrlWithManagedDisabled = exports.visitUrlWithManagedEnabled = exports.expectManagedDisabled = exports.nonManagedAccount = exports.managedAccount = void 0;
var account_1 = require("support/intercepts/account");
var skip_1 = require("support/util/skip");
var accountSettings_1 = require("src/factories/accountSettings");
// / Account object with Managed enabled for mocking API requests.
exports.managedAccount = accountSettings_1.accountSettingsFactory.build({
    managed: true,
});
// / Account object without Managed enabled for mocking API requests.
exports.nonManagedAccount = accountSettings_1.accountSettingsFactory.build({
    managed: false,
});
/**
 * Skips the test if Linode Managed is enabled on the test account.
 *
 * Certain tests only function correctly if Managed is disabled, and this function
 * can be used to skip such tests when Managed is enabled.
 *
 * Optionally, if the `CY_TEST_FAIL_ON_MANAGED` environment variable is defined,
 * the test will fail rather than being skipped. This is useful in environments
 * where Managed is not expected to be enabled (e.g. when being run via CI).
 */
var expectManagedDisabled = function () {
    var accountSettings = Cypress.env('cloudManagerAccountSettings');
    var failOnManaged = Cypress.env('CY_TEST_FAIL_ON_MANAGED');
    if (!accountSettings) {
        throw new Error('Unable to retrieve cached account settings');
    }
    if (accountSettings.managed) {
        if (failOnManaged) {
            throw new Error('Test failed because Managed is enabled on the test account. This test expects Managed to be disabled.');
        }
        cy.log('Skipping test because Managed is enabled on test account');
        (0, skip_1.skip)();
    }
};
exports.expectManagedDisabled = expectManagedDisabled;
/**
 * Visits the given Manager URL with account settings mocked to enable Managed.
 *
 * @param url - URL to visit.
 */
var visitUrlWithManagedEnabled = function (url) {
    (0, account_1.mockGetAccountSettings)(exports.managedAccount).as('getAccountSettings');
    cy.visitWithLogin(url);
    cy.wait('@getAccountSettings');
};
exports.visitUrlWithManagedEnabled = visitUrlWithManagedEnabled;
/**
 * Visits the given Manager URL with account settings mocked to disable Managed.
 *
 * @param url - URL to visit.
 */
var visitUrlWithManagedDisabled = function (url) {
    (0, account_1.mockGetAccountSettings)(exports.nonManagedAccount).as('getAccountSettings');
    cy.visitWithLogin(url);
    cy.wait('@getAccountSettings');
};
exports.visitUrlWithManagedDisabled = visitUrlWithManagedDisabled;
