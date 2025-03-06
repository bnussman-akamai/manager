"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interceptOnce = exports.waitForAppLoad = void 0;
/* eslint-disable cypress/no-unnecessary-waiting */
var intercepts_1 = require("support/util/intercepts");
var waitForAppLoad = function (path, withLogin) {
    if (path === void 0) { path = '/'; }
    if (withLogin === void 0) { withLogin = true; }
    cy.intercept('GET', (0, intercepts_1.apiMatcher)('account')).as('getAccount');
    cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile')).as('getProfile');
    cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/settings')).as('getAccountSettings');
    cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile/preferences')).as('getProfilePreferences');
    cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/notifications**')).as('getNotifications');
    withLogin ? cy.visitWithLogin(path) : cy.visit(path);
    cy.wait([
        '@getAccount',
        '@getAccountSettings',
        '@getProfilePreferences',
        '@getProfile',
        '@getNotifications',
    ]);
};
exports.waitForAppLoad = waitForAppLoad;
// use this if the call happens multiple times but you only want to intercept it once
var interceptOnce = function (method, url, response) {
    var count = 0;
    return cy.intercept(method, url, function (req) {
        count += 1;
        if (count < 2) {
            req.reply(response);
        }
    });
};
exports.interceptOnce = interceptOnce;
