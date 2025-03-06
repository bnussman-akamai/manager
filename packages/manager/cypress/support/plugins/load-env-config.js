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
exports.loadEnvironmentConfig = void 0;
var dotenv = require("dotenv");
var path_1 = require("path");
var url_1 = require("url");
/**
 * Populates Cypress configuration `env` object with environment variables.
 *
 * If present, environment variables will also be loaded from `packages/manager/.env`.
 *
 * @returns Configuration with environment variables.
 */
var loadEnvironmentConfig = function (_on, config) {
    var _a;
    var dotenvPath = (0, path_1.resolve)((0, url_1.fileURLToPath)(import.meta.url), '..', '..', '..', '..', '.env');
    var conf = dotenv.config({
        path: dotenvPath,
    });
    if (conf.error) {
        console.warn('Failed to load .env file from `packages/manager/.env`. Does the file exist?');
        console.warn(conf.error);
        console.warn('.env file will be ignored.');
    }
    return __assign(__assign({}, config), { env: __assign(__assign(__assign({}, config.env), ((_a = conf.parsed) !== null && _a !== void 0 ? _a : [])), process.env) });
};
exports.loadEnvironmentConfig = loadEnvironmentConfig;
