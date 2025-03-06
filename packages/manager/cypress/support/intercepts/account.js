"use strict";
/**
 * @file Cypress intercepts and mocks for Cloud Manager account requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockEnableLinodeManagedError = exports.mockEnableLinodeManaged = exports.interceptGetAccountAvailability = exports.mockGetMaintenance = exports.interceptGetNetworkUtilization = exports.mockGetAccountLogins = exports.mockCreateChildAccountTokenError = exports.mockCreateChildAccountToken = exports.mockGetChildAccountsError = exports.mockGetChildAccounts = exports.mockUpdateAccountAgreements = exports.mockGetAccountAgreements = exports.mockCancelAccountError = exports.mockCancelAccount = exports.mockGetPayments = exports.interceptGetPayments = exports.mockGetInvoiceItems = exports.mockGetInvoices = exports.interceptGetInvoices = exports.mockGetInvoice = exports.mockSetDefaultPaymentMethod = exports.mockGetPaymentMethods = exports.interceptGetPaymentMethods = exports.mockUpdateUsername = exports.mockUpdateAccountSettings = exports.mockGetAccountSettings = exports.mockAcceptEntityTransfer = exports.mockReceiveEntityTransfer = exports.mockGetEntityTransfersError = exports.mockGetEntityTransfers = exports.mockInitiateEntityTransferError = exports.interceptInitiateEntityTransfer = exports.mockUpdateUserGrants = exports.mockGetUserGrants = exports.mockGetUserGrantsUnrestrictedAccess = exports.mockDeleteUser = exports.mockUpdateUser = exports.mockAddUser = exports.mockGetUser = exports.interceptGetUser = exports.mockGetUsers = exports.mockGetAccountAvailability = exports.mockUpdateAccount = exports.interceptGetAccount = exports.mockGetAccount = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var request_1 = require("support/util/request");
var response_1 = require("support/util/response");
/**
 * Intercepts GET request to fetch account and mocks response.
 *
 * @param account - Account data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetAccount = function (account) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account'), (0, response_1.makeResponse)(account));
};
exports.mockGetAccount = mockGetAccount;
/**
 * Intercepts GET request to fetch account.
 *
 * @returns Cypress chainable.
 */
var interceptGetAccount = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account'));
};
exports.interceptGetAccount = interceptGetAccount;
/**
 * Intercepts PUT request to update account and mocks response.
 *
 * @param updatedAccount - Updated account data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateAccount = function (updatedAccount) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)('account'), (0, response_1.makeResponse)(updatedAccount));
};
exports.mockUpdateAccount = mockUpdateAccount;
/**
 * Intercepts GET request to fetch account availability data and mocks response.
 *
 * @param accountAvailability - Account availability objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetAccountAvailability = function (accountAvailability) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/availability*'), (0, paginate_1.paginateResponse)(accountAvailability));
};
exports.mockGetAccountAvailability = mockGetAccountAvailability;
/**
 * Intercepts GET request to fetch account users and mocks response.
 *
 * @param users - User objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetUsers = function (users) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/users*'), (0, paginate_1.paginateResponse)(users));
};
exports.mockGetUsers = mockGetUsers;
/**
 * Intercepts GET request to fetch account user information.
 *
 * @param username - Username of user whose info is being fetched.
 *
 * @returns Cypress chainable.
 */
var interceptGetUser = function (username) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/users/".concat(username)));
};
exports.interceptGetUser = interceptGetUser;
/**
 * Intercepts GET request to fetch account user information and mocks response.
 *
 * @param username - Username of user whose info is being fetched.
 *
 * @returns Cypress chainable.
 */
var mockGetUser = function (user) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/users/".concat(user.username)), (0, response_1.makeResponse)(user));
};
exports.mockGetUser = mockGetUser;
/**
 * Intercepts POST request to add an account user and mocks response.
 *
 * @param user - New user account info with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockAddUser = function (user) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('account/users'), (0, response_1.makeResponse)(user));
};
exports.mockAddUser = mockAddUser;
/**
 * Intercepts PUT request to update account user information and mocks response.
 *
 * @param username - Username of user to update.
 * @param updatedUser - Updated user account info with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateUser = function (username, updatedUser) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("account/users/".concat(username)), (0, response_1.makeResponse)(updatedUser));
};
exports.mockUpdateUser = mockUpdateUser;
/**
 * Intercepts DELETE request to remove account user.
 *
 * @param username - Username of user to delete.
 *
 * @returns Cypress chainable.
 */
var mockDeleteUser = function (username) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("account/users/".concat(username)), (0, response_1.makeResponse)());
};
exports.mockDeleteUser = mockDeleteUser;
/**
 * Intercepts GET request to fetch account user grants and mocks response.
 *
 * The mocked response contains a 204 status code and no body, indicating that
 * the mocked user has unrestricted account access.
 *
 * @param username - Username of user for which to fetch grants.
 *
 * @returns Cypress chainable.
 */
var mockGetUserGrantsUnrestrictedAccess = function (username) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/users/".concat(username, "/grants")), (0, response_1.makeResponse)(undefined, 204));
};
exports.mockGetUserGrantsUnrestrictedAccess = mockGetUserGrantsUnrestrictedAccess;
/**
 * Intercepts GET request to fetch account user grants and mocks response.
 *
 * @param username - Username of user for which to fetch grants.
 *
 * @returns Cypress chainable.
 */
var mockGetUserGrants = function (username, grants) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/users/".concat(username, "/grants")), (0, response_1.makeResponse)(grants));
};
exports.mockGetUserGrants = mockGetUserGrants;
/**
 * Intercepts PUT request to update account user grants and mocks response.
 *
 * @param username - Username of user for which to update grants.
 * @param grants - Updated grants with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateUserGrants = function (username, grants) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("account/users/".concat(username, "/grants")), (0, response_1.makeResponse)(grants));
};
exports.mockUpdateUserGrants = mockUpdateUserGrants;
/**
 * Intercepts POST request to generate entity transfer token.
 *
 * @returns Cypress chainable.
 */
var interceptInitiateEntityTransfer = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('account/entity-transfers'));
};
exports.interceptInitiateEntityTransfer = interceptInitiateEntityTransfer;
/**
 * Intercepts POST request to generate entity transfer token and mocks response.
 *
 * @param errorMessage - Mocks an error response with the given message.
 *
 * @returns Cypress chainable.
 */
var mockInitiateEntityTransferError = function (errorMessage) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('account/entity-transfers'), (0, errors_1.makeErrorResponse)(errorMessage));
};
exports.mockInitiateEntityTransferError = mockInitiateEntityTransferError;
/**
 * Intercepts GET request to fetch entity transfers and mocks the response.
 *
 * This intercept will catch any request to the GET entity transfer endpoint,
 * but will respond according to the contents of the `x-filter` header.
 *
 * If the filter indicates a request for pending transfers, the response will
 * contain the contents of the `pending` array. Likewise, if the filter
 * indicates a request for either received or sent transfers, the response
 * will reflect the given `received` or `sent` array, respectively. If the
 * request contains an unexpected filter or no filter, the response will not
 * be mocked at all.
 *
 * @param pending - Mocked entity transfers with which to respond for pending entity requests.
 * @param received - Mocked entity transfers with which to respond for received entity requests.
 * @param sent - Mocked entity transfers with which to respond for sent entity requests.
 */
var mockGetEntityTransfers = function (pending, received, sent) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/entity-transfers*'), function (req) {
        var filters = (0, request_1.getFilters)(req);
        if ((filters === null || filters === void 0 ? void 0 : filters['status']) === 'pending') {
            req.reply((0, paginate_1.paginateResponse)(pending));
            return;
        }
        if ((filters === null || filters === void 0 ? void 0 : filters['+and']) && Array.isArray(filters['+and'])) {
            var compositeFilters = filters['+and'];
            // Confirm that `is_sender` is set, and, if so, that it has the expected value.
            var hasTrueSenderValue = compositeFilters.some(function (compositeFilter) { return compositeFilter['is_sender'] === true; });
            var hasFalseSenderValue = compositeFilters.some(function (compositeFilter) { return compositeFilter['is_sender'] === false; });
            if (hasTrueSenderValue) {
                req.reply((0, paginate_1.paginateResponse)(sent));
                return;
            }
            if (hasFalseSenderValue) {
                req.reply((0, paginate_1.paginateResponse)(received));
                return;
            }
        }
        req.continue();
    });
};
exports.mockGetEntityTransfers = mockGetEntityTransfers;
/**
 * Intercepts GET request to fetch service transfers and mocks an error response.
 *
 * @param errorMessage - API error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetEntityTransfersError = function (errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error has occurred'; }
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/entity-transfers*'), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockGetEntityTransfersError = mockGetEntityTransfersError;
/**
 * Intercepts GET request to receive entity transfer and mocks response.
 *
 * @param token - Token for entity transfer request to mock.
 * @param transfer - Entity transfer data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockReceiveEntityTransfer = function (token, transfer) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/entity-transfers/".concat(token)), transfer);
};
exports.mockReceiveEntityTransfer = mockReceiveEntityTransfer;
/**
 * Intercepts POST request to accept entity transfer and mocks response.
 *
 * @param token - Token for entity transfer request to mock.
 *
 * @returns Cypress chainable.
 */
var mockAcceptEntityTransfer = function (token) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("account/entity-transfers/".concat(token, "/accept")), {});
};
exports.mockAcceptEntityTransfer = mockAcceptEntityTransfer;
/**
 * Intercepts GET request to fetch account settings and mocks response.
 *
 * @param settings - Account settings mock data with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetAccountSettings = function (settings) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/settings'), settings);
};
exports.mockGetAccountSettings = mockGetAccountSettings;
/**
 * Intercepts PUT request to update account settings and mocks response.
 *
 * @param settings - Account settings mock data with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockUpdateAccountSettings = function (settings) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)('account/settings'), settings);
};
exports.mockUpdateAccountSettings = mockUpdateAccountSettings;
/**
 * Intercepts PUT request to update account username and mocks response.
 *
 * @param oldUsername - The original username which will be changed.
 * @param newUsername - The new username for the account.
 * @param restricted - Whether or not the account is restricted.
 *
 * @returns Cypress chainable.
 */
var mockUpdateUsername = function (oldUsername, newUsername, restricted) {
    if (restricted === void 0) { restricted = false; }
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("account/users/".concat(oldUsername)), {
        email: 'mockEmail@example.com',
        restricted: restricted,
        ssh_keys: [],
        tfa_enabled: false,
        username: newUsername,
        verified_phone_number: null,
    });
};
exports.mockUpdateUsername = mockUpdateUsername;
/**
 * Intercepts GET request to retrieve account payment methods.
 *
 * @returns Cypress chainable.
 */
var interceptGetPaymentMethods = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/payment-methods*'));
};
exports.interceptGetPaymentMethods = interceptGetPaymentMethods;
/**
 * Intercepts GET request to retrieve account payment methods and mocks response.
 *
 * @param paymentMethods - Array of payment methods with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetPaymentMethods = function (paymentMethods) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/payment-methods*'), (0, paginate_1.paginateResponse)(paymentMethods));
};
exports.mockGetPaymentMethods = mockGetPaymentMethods;
/**
 * Intercepts POST request to set default account payment method and mocks response.
 *
 * @param paymentMethodId - ID of payment method for which to intercept request.
 *
 * @returns Cypress chainable.
 */
var mockSetDefaultPaymentMethod = function (paymentMethodId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("account/payment-methods/".concat(paymentMethodId, "/make-default")), {});
};
exports.mockSetDefaultPaymentMethod = mockSetDefaultPaymentMethod;
/**
 * Intercepts GET request to fetch an account invoice and mocks response.
 *
 * @param invoice - Invoice with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetInvoice = function (invoice) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/invoices/".concat(invoice.id)), (0, response_1.makeResponse)(invoice));
};
exports.mockGetInvoice = mockGetInvoice;
/**
 * Intercepts GET request to fetch account invoices.
 *
 * @returns Cypress chainable.
 */
var interceptGetInvoices = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/invoices*'));
};
exports.interceptGetInvoices = interceptGetInvoices;
/**
 * Intercepts GET request to fetch account invoices and mocks response.
 *
 * @param invoices - Invoice data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetInvoices = function (invoices) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/invoices*'), (0, paginate_1.paginateResponse)(invoices));
};
exports.mockGetInvoices = mockGetInvoices;
/**
 * Intercepts GET request to fetch an account invoice's items and mocks response.
 *
 * @param invoice - Invoice for which to retrieve invoice items.
 * @param items - Invoice items with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetInvoiceItems = function (invoice, items) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/invoices/".concat(invoice.id, "/items*")), (0, paginate_1.paginateResponse)(items));
};
exports.mockGetInvoiceItems = mockGetInvoiceItems;
/**
 * Intercepts GET request to fetch account payments.
 *
 * @returns Cypress chainable.
 */
var interceptGetPayments = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/payments*'));
};
exports.interceptGetPayments = interceptGetPayments;
/**
 * Intercepts GET request to fetch account payments and mocks response.
 *
 * @param payments - Payment data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetPayments = function (payments) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/payments*'), (0, paginate_1.paginateResponse)(payments));
};
exports.mockGetPayments = mockGetPayments;
/**
 * Intercepts POST request to cancel account and mocks cancellation response.
 *
 * @param cancellation - Account cancellation object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCancelAccount = function (cancellation) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('account/cancel'), (0, response_1.makeResponse)(cancellation));
};
exports.mockCancelAccount = mockCancelAccount;
/**
 * Intercepts POST request to cancel account and mocks an API error response.
 *
 * @param errorMessage - Error message to include in mock error response.
 * @param status - HTTP status for mock error response.
 *
 * @returns Cypress chainable.
 */
var mockCancelAccountError = function (errorMessage, status) {
    if (status === void 0) { status = 400; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('account/cancel'), (0, errors_1.makeErrorResponse)(errorMessage, status));
};
exports.mockCancelAccountError = mockCancelAccountError;
/**
 * Intercepts GET request to fetch the account agreements and mocks the response.
 *
 * @param agreements - Agreements with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetAccountAgreements = function (agreements) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/agreements"), (0, response_1.makeResponse)(agreements));
};
exports.mockGetAccountAgreements = mockGetAccountAgreements;
/**
 * Intercepts POST request to update account agreements and mocks response.
 *
 * @param agreements - Agreements with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateAccountAgreements = function (agreements) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("account/agreements"), (0, response_1.makeResponse)(agreements));
};
exports.mockUpdateAccountAgreements = mockUpdateAccountAgreements;
/**
 * Intercepts GET request to fetch child accounts and mocks the response.
 *
 * @param childAccounts - Child account objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetChildAccounts = function (childAccounts) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/child-accounts*'), (0, paginate_1.paginateResponse)(childAccounts));
};
exports.mockGetChildAccounts = mockGetChildAccounts;
/**
 * Intercepts GET request to fetch child accounts and mocks an error response.
 *
 * @param errorMessage - API error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetChildAccountsError = function (errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error has occurred'; }
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/child-accounts*'), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockGetChildAccountsError = mockGetChildAccountsError;
/**
 * Intercepts POST request to create a child account token and mocks the response.
 *
 * @param childAccount - Child account for which to create a token.
 * @param childAccountToken - Token object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateChildAccountToken = function (childAccount, childAccountToken) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("account/child-accounts/".concat(childAccount.euuid, "/token")), (0, response_1.makeResponse)(childAccountToken));
};
exports.mockCreateChildAccountToken = mockCreateChildAccountToken;
/**
 * Intercepts POST request to create a child account token and mocks error response.
 *
 * @param childAccount - Child account for which to mock error response.
 * @param errorMessage - API error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateChildAccountTokenError = function (childAccount, errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error has occurred'; }
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("account/child-accounts/".concat(childAccount.euuid, "/token")), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockCreateChildAccountTokenError = mockCreateChildAccountTokenError;
/**
 * Intercepts GET request to fetch the account logins and mocks the response.
 *
 * @param accountLogins - Account login objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetAccountLogins = function (accountLogins) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/logins*"), (0, paginate_1.paginateResponse)(accountLogins));
};
exports.mockGetAccountLogins = mockGetAccountLogins;
/**
 * Intercepts GET request to fetch the account network utilization data.
 *
 * @returns Cypress chainable.
 */
var interceptGetNetworkUtilization = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/transfer'));
};
exports.interceptGetNetworkUtilization = interceptGetNetworkUtilization;
/**
 * Intercepts GET request to fetch the account maintenance and mocks the response.
 *
 * @param accountMaintenance - Account Maintenance objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetMaintenance = function (accountPendingMaintenance, accountCompletedMaintenance) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("account/maintenance*"), function (req) {
        var filters = (0, request_1.getFilters)(req);
        if ((filters === null || filters === void 0 ? void 0 : filters['status']) === 'completed') {
            req.reply((0, paginate_1.paginateResponse)(accountCompletedMaintenance));
        }
        else {
            req.reply((0, paginate_1.paginateResponse)(accountPendingMaintenance));
        }
    });
};
exports.mockGetMaintenance = mockGetMaintenance;
/**
 * Intercepts GET request to fetch account region availability.
 *
 * @returns Cypress chainable.
 */
var interceptGetAccountAvailability = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/availability*'));
};
exports.interceptGetAccountAvailability = interceptGetAccountAvailability;
/**
 * Mocks POST request to enable the Linode Managed.
 *
 * @returns Cypress chainable.
 */
var mockEnableLinodeManaged = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('account/settings/managed-enable'), (0, response_1.makeResponse)());
};
exports.mockEnableLinodeManaged = mockEnableLinodeManaged;
/**
 * Mocks POST request to to enable the Linode Managed and mocks an error response.
 *
 * @param errorMessage - API error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockEnableLinodeManagedError = function (errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error has occurred'; }
    if (statusCode === void 0) { statusCode = 400; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('account/settings/managed-enable'), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockEnableLinodeManagedError = mockEnableLinodeManagedError;
