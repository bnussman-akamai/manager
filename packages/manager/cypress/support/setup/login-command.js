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
var luxon_1 = require("luxon");
var api_1 = require("support/constants/api");
var intercepts_1 = require("support/util/intercepts");
var overrideLocalStorage = function (window, storageOverrides) {
    Object.keys(storageOverrides).forEach(function (key) {
        var value = storageOverrides[key];
        window.localStorage.setItem(key, value);
    });
};
var _loginWithToken = function (win) {
    win.localStorage.setItem('authentication/scopes', '*');
    win.localStorage.setItem('authentication/token', 'Bearer ' + api_1.oauthToken);
    win.localStorage.setItem('authentication/expire', luxon_1.DateTime.local().plus({ days: 30 }).toISO());
};
Cypress.Commands.add('visitWithLogin', function (url, linodeOptions, cypressOptions) {
    var defaultLinodeOptions = {
        localStorageOverrides: undefined,
        preferenceOverrides: undefined,
    };
    var resolvedLinodeOptions = linodeOptions
        ? __assign(__assign({}, defaultLinodeOptions), linodeOptions) : defaultLinodeOptions;
    // returning false here prevents Cypress from
    // failing the test with newrelic errors
    Cypress.on('uncaught:exception', function (_err, _runnable) { return false; });
    var opt = {
        onBeforeLoad: function (win) {
            _loginWithToken(win);
            if (resolvedLinodeOptions.localStorageOverrides) {
                overrideLocalStorage(win, resolvedLinodeOptions.localStorageOverrides);
            }
        },
        failOnStatusCode: false,
    };
    if (resolvedLinodeOptions.preferenceOverrides) {
        cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile/preferences*'), function (request) {
            request.continue(function (response) {
                response.body = __assign(__assign({}, response === null || response === void 0 ? void 0 : response.body), resolvedLinodeOptions.preferenceOverrides);
            });
        });
    }
    return cy.visit(url, __assign(__assign({}, cypressOptions), opt));
});
