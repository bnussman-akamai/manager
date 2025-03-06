"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAccountRequest = void 0;
var account_1 = require("support/intercepts/account");
/**
 * Mocks the Linode API account info GET request to improve performance.
 *
 * If cached account data is not available, no mocking occurs. Mocks can be
 * overridden on a case-by-case basis by using the `mockGetAccount` utility
 * within tests.
 */
var mockAccountRequest = function () {
    // `cloudManagerAccount` is fetched during setup if the `fetchAccount` plugin is used.
    // See also: `cypress/support/plugins/fetch-account.ts`.
    var cachedAccount = Cypress.env('cloudManagerAccount');
    // Short-circuit with a warning if no cached account data is available.
    if (!cachedAccount) {
        console.warn('Cached Linode account data is not present. Performance may be impacted.');
        return;
    }
    beforeEach(function () {
        (0, account_1.mockGetAccount)(cachedAccount);
    });
};
exports.mockAccountRequest = mockAccountRequest;
