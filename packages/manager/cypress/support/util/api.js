"use strict";
/**
 * @file Utilities to help configure @linode/api-v4 package.
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
exports.configureLinodeApi = exports.defaultApiRoot = void 0;
var api_v4_1 = require("@linode/api-v4");
var axios_1 = require("axios");
// Note: This file is imported by Cypress plugins, and indirectly by Cypress
// tests. Because Cypress has not been initiated when plugins are executed, we
// cannot use any Cypress functionality in this module without causing a crash
// at startup.
/**
 * Default API root URL to use for replacement logic when using a URL override.
 *
 * This value is copied from the @linode/api-v4 package.
 *
 * @link https://github.com/linode/manager/blob/develop/packages/api-v4/src/request.ts
 */
exports.defaultApiRoot = 'https://api.linode.com/v4';
/**
 * Configures and authenticates Linode API requests initiated by Cypress.
 *
 * @param accessToken - API access token with which to authenticate requests.
 * @param baseUrl - Optional Linode API base URL.
 */
var configureLinodeApi = function (accessToken, baseUrl) {
    api_v4_1.baseRequest.interceptors.request.use(function (config) {
        var headers = new axios_1.AxiosHeaders(config.headers);
        headers.set('Authorization', "Bearer ".concat(accessToken));
        // If a base URL is provided, override the request URL
        // using the given base URL.
        if (baseUrl && config.url) {
            config.url = config.url.replace(exports.defaultApiRoot, baseUrl);
        }
        return __assign(__assign({}, config), { headers: headers });
    });
};
exports.configureLinodeApi = configureLinodeApi;
