"use strict";
/**
 * @file Cypress intercepts and mocks for Cloud Manager profile requests.
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
exports.mockDeleteSSHKey = exports.mockUpdateSSHKey = exports.mockCreateSSHKeyError = exports.mockCreateSSHKey = exports.interceptCreateSSHKey = exports.mockGetSSHKey = exports.mockGetSSHKeys = exports.mockResetOAuthApps = exports.mockUpdateOAuthApps = exports.mockDeleteOAuthApps = exports.mockGetOAuthApps = exports.mockCreateOAuthApp = exports.mockRevokePersonalAccessToken = exports.mockUpdatePersonalAccessToken = exports.mockCreatePersonalAccessToken = exports.mockGetPersonalAccessTokens = exports.mockRevokeAppToken = exports.mockGetAppTokens = exports.mockConfirmTwoFactorAuth = exports.mockDisableTwoFactorAuth = exports.mockEnableTwoFactorAuth = exports.mockUpdateSecurityQuestions = exports.mockGetSecurityQuestions = exports.mockVerifyVerificationCode = exports.mockSendVerificationCode = exports.mockSmsVerificationOptOut = exports.mockUpdateUserPreferences = exports.mockGetUserPreferences = exports.mockGetProfileGrants = exports.mockUpdateProfile = exports.mockGetProfile = exports.interceptGetProfile = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
/**
 * Intercepts GET request to fetch user profile.
 *
 * @returns Cypress chainable.
 */
var interceptGetProfile = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile'));
};
exports.interceptGetProfile = interceptGetProfile;
/**
 * Intercepts GET request to fetch user profile and mocks response.
 *
 * @param profile - Profile with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetProfile = function (profile) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile'), profile);
};
exports.mockGetProfile = mockGetProfile;
/**
 * Intercepts PUT request to update a profile and mocks response.
 *
 * @param profile - Updated Profile with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateProfile = function (profile) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)('profile'), (0, response_1.makeResponse)(profile));
};
exports.mockUpdateProfile = mockUpdateProfile;
/**
 * Intercepts GET request to fetch profile grants and mocks response.
 *
 * @param grants - Grants object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetProfileGrants = function (grants) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile/grants'), (0, response_1.makeResponse)(grants));
};
exports.mockGetProfileGrants = mockGetProfileGrants;
/**
 * Intercepts GET request to fetch user preferences and mocks response.
 *
 * @param preferences - User preferences with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetUserPreferences = function (preferences) {
    var defaultPreferences = {
        // All sidebar categories are expanded.
        collapsedSideNavProductFamilies: [],
        // Sidebar is not pinned.
        desktop_sidebar_open: false,
        // Type-to-confirm is enabled.
        type_to_confirm: true,
    };
    var resolvedPreferences = __assign(__assign({}, defaultPreferences), preferences);
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile/preferences'), resolvedPreferences);
};
exports.mockGetUserPreferences = mockGetUserPreferences;
/**
 * Intercepts PUT request to update user preferences and mocks response.
 *
 * @param preferences - Updated user preferences with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockUpdateUserPreferences = function (preferences) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)('profile/preferences'), preferences);
};
exports.mockUpdateUserPreferences = mockUpdateUserPreferences;
/**
 * Intercepts POST request to opt out of SMS verification and mocks response.
 *
 * @returns Cypress chainable.
 */
var mockSmsVerificationOptOut = function () {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)('profile/phone-number'), {});
};
exports.mockSmsVerificationOptOut = mockSmsVerificationOptOut;
/**
 * Intercepts POST request to send SMS verification code and mocks response.
 *
 * @returns Cypress chainable.
 */
var mockSendVerificationCode = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('profile/phone-number'), {});
};
exports.mockSendVerificationCode = mockSendVerificationCode;
/**
 * Intercepts POST request to verify SMS verification code and mocks response.
 *
 * If an `errorMessage` is provided, the mocked response will indicate an error.
 * Otherwise, a successful response is mocked.
 *
 * @param errorMessage - If specified, mocks an error response with the given message.
 *
 * @returns Cypress chainable.
 */
var mockVerifyVerificationCode = function (errorMessage) {
    var response = !!errorMessage ? (0, errors_1.makeErrorResponse)(errorMessage) : {};
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('profile/phone-number/verify'), response);
};
exports.mockVerifyVerificationCode = mockVerifyVerificationCode;
/**
 * Intercepts GET request to fetch security question data and mocks response.
 *
 * @param securityQuestionsData - Security questions response data.
 *
 * @returns Cypress chainable.
 */
var mockGetSecurityQuestions = function (securityQuestionsData) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile/security-questions'), securityQuestionsData);
};
exports.mockGetSecurityQuestions = mockGetSecurityQuestions;
/**
 * Intercepts POST request to update security questions and mocks response.
 *
 * @param securityQuestionsPayload - Security questions response data.
 *
 * @returns Cypress chainable.
 */
var mockUpdateSecurityQuestions = function (securityQuestionsPayload) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('profile/security-questions'), securityQuestionsPayload);
};
exports.mockUpdateSecurityQuestions = mockUpdateSecurityQuestions;
/**
 * Intercepts POST request to enable 2FA and mocks the response.
 *
 * @param secretString - Secret 2FA key to include in mocked response.
 *
 * @returns Cypress chainable.
 */
var mockEnableTwoFactorAuth = function (secretString) {
    // TODO Create an expiration date based on the current time.
    var expiry = '2025-05-01T03:59:59';
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('profile/tfa-enable'), {
        expiry: expiry,
        secret: secretString,
    });
};
exports.mockEnableTwoFactorAuth = mockEnableTwoFactorAuth;
/**
 * Intercepts POST request to disable two factor authentication and mocks response.
 *
 * @returns Cypress chainable.
 */
var mockDisableTwoFactorAuth = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('profile/tfa-disable'), {});
};
exports.mockDisableTwoFactorAuth = mockDisableTwoFactorAuth;
/**
 * Intercepts POST request to confirm two factor authentication and mocks response.
 *
 * @param scratchCode - Mocked 2FA scratch code.
 *
 * @returns Cypress chainable.
 */
var mockConfirmTwoFactorAuth = function (scratchCode) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('profile/tfa-enable-confirm'), {
        scratch: scratchCode,
    });
};
exports.mockConfirmTwoFactorAuth = mockConfirmTwoFactorAuth;
/**
 * Intercepts GET request to retrieve third party app tokens and mocks response.
 *
 * @param tokens - Array of third party app tokens with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetAppTokens = function (tokens) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile/apps*'), (0, paginate_1.paginateResponse)(tokens));
};
exports.mockGetAppTokens = mockGetAppTokens;
/**
 * Intercepts DELETE request to revoke a third party app token and mocks response.
 *
 * @param id - ID of token for intercepted revoke request.
 *
 * @returns Cypress chainable.
 */
var mockRevokeAppToken = function (id) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("profile/apps/".concat(id)), (0, response_1.makeResponse)({}));
};
exports.mockRevokeAppToken = mockRevokeAppToken;
/**
 * Intercepts GET request to retrieve personal access tokens and mocks response.
 *
 * @param tokens - Array of personal access tokens with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetPersonalAccessTokens = function (tokens) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile/tokens*'), (0, paginate_1.paginateResponse)(tokens));
};
exports.mockGetPersonalAccessTokens = mockGetPersonalAccessTokens;
/**
 * Intercepts POST request to create a personal access token and mocks response.
 *
 * @param token - Personal access token with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockCreatePersonalAccessToken = function (token) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('profile/tokens'), (0, response_1.makeResponse)(token));
};
exports.mockCreatePersonalAccessToken = mockCreatePersonalAccessToken;
/**
 * Intercepts PUT request to update a personal access token and mocks response.
 *
 * @param id - ID of token for intercepted update request.
 * @param updatedToken - Token data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdatePersonalAccessToken = function (id, updatedToken) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("profile/tokens/".concat(id)), (0, response_1.makeResponse)(updatedToken));
};
exports.mockUpdatePersonalAccessToken = mockUpdatePersonalAccessToken;
/**
 * Intercepts DELETE request to revoke a personal access token and mocks response.
 *
 * @param id - ID of token for intercepted revoke request.
 *
 * @returns Cypress chainable.
 */
var mockRevokePersonalAccessToken = function (id) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("profile/tokens/".concat(id)), (0, response_1.makeResponse)({}));
};
exports.mockRevokePersonalAccessToken = mockRevokePersonalAccessToken;
/**
 * Intercepts POST request to create an oauth app and mocks response.
 *
 * @param oauthApp - oauth app with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockCreateOAuthApp = function (oauthApp) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('account/oauth-clients*'), oauthApp);
};
exports.mockCreateOAuthApp = mockCreateOAuthApp;
/**
 * Intercepts GET request to fetch oauth apps and mocks response.
 *
 * @param oauthApps - oauth apps with which to respond.
 *
 * @returns Cypress chainable.
 */
var mockGetOAuthApps = function (oauthApps) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/oauth-clients*'), (0, paginate_1.paginateResponse)(oauthApps));
};
exports.mockGetOAuthApps = mockGetOAuthApps;
/**
 * Intercepts DELETE request to delete an oauth app.
 *
 * @param oauthApp - An oauth app with which to reset.
 *
 * @returns Cypress chainable.
 */
var mockDeleteOAuthApps = function (appId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("account/oauth-clients/".concat(appId)), (0, response_1.makeResponse)({}));
};
exports.mockDeleteOAuthApps = mockDeleteOAuthApps;
/**
 * Intercepts PUT request to update an oauth and mocks response.
 *
 * @param oauthApp - An OAuth App with which to update.
 *
 * @returns Cypress chainable.
 */
var mockUpdateOAuthApps = function (appId, oauthApp) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("account/oauth-clients/".concat(appId)), oauthApp);
};
exports.mockUpdateOAuthApps = mockUpdateOAuthApps;
/**
 * Intercepts POST request to fetch oauth apps and mocks response.
 *
 * @param oauthApp - An OAuth App with which to reset.
 *
 * @returns Cypress chainable.
 */
var mockResetOAuthApps = function (appId, oauthApp) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("account/oauth-clients/".concat(appId, "/reset-secret")), oauthApp);
};
exports.mockResetOAuthApps = mockResetOAuthApps;
/**
 * Intercepts GET request to fetch SSH keys and mocks the response.
 *
 * @param sshKeys - Array of SSH key objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetSSHKeys = function (sshKeys) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('/profile/sshkeys*'), (0, paginate_1.paginateResponse)(sshKeys));
};
exports.mockGetSSHKeys = mockGetSSHKeys;
/**
 * Intercepts GET request to fetch an SSH key and mocks the response.
 *
 * @param sshKey - SSH key object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetSSHKey = function (sshKey) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("/profile/sshkeys/".concat(sshKey.id)), (0, response_1.makeResponse)(sshKey));
};
exports.mockGetSSHKey = mockGetSSHKey;
/**
 * Intercepts POST request to create an SSH key.
 *
 * @returns Cypress chainable.
 */
var interceptCreateSSHKey = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("profile/sshkeys*"));
};
exports.interceptCreateSSHKey = interceptCreateSSHKey;
/**
 * Intercepts POST request to create an SSH key and mocks response.
 *
 * @param sshKey - An SSH key with which to create.
 *
 * @returns Cypress chainable.
 */
var mockCreateSSHKey = function (sshKey) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("profile/sshkeys"), sshKey);
};
exports.mockCreateSSHKey = mockCreateSSHKey;
/**
 * Intercepts POST request to create an SSH key and mocks an API error response.
 *
 * @param errorMessage - Error message to include in mock error response.
 * @param status - HTTP status for mock error response.
 *
 * @returns Cypress chainable.
 */
var mockCreateSSHKeyError = function (errorMessage, status) {
    if (status === void 0) { status = 400; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('profile/sshkeys'), (0, errors_1.makeErrorResponse)(errorMessage, status));
};
exports.mockCreateSSHKeyError = mockCreateSSHKeyError;
/**
 * Intercepts PUT request to update an SSH key and mocks response.
 *
 * @param sshKeyId - The SSH key ID to update
 * @param sshKey - An SSH key with which to update.
 *
 * @returns Cypress chainable.
 */
var mockUpdateSSHKey = function (sshKeyId, sshKey) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("profile/sshkeys/".concat(sshKeyId)), sshKey);
};
exports.mockUpdateSSHKey = mockUpdateSSHKey;
/**
 * Intercepts DELETE request to delete an SSH key and mocks response.
 *
 * @param sshKeyId - The SSH key ID to delete
 *
 * @returns Cypress chainable.
 */
var mockDeleteSSHKey = function (sshKeyId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("profile/sshkeys/".concat(sshKeyId)), {});
};
exports.mockDeleteSSHKey = mockDeleteSSHKey;
