"use strict";
/**
 * @file Allows Cypress file watching to be configured via env vars or .env files.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureFileWatching = void 0;
// The name of the environment variable to read when checking file watch configuration.
var envVarName = 'CY_TEST_DISABLE_FILE_WATCHING';
/**
 * Optionally disables file watching when using the Cypress debugger.
 *
 * File watching is disabled if `CY_TEST_DISABLE_FILE_WATCHING` is set, and
 * remains enabled otherwise.
 *
 * @returns Cypress configuration object.
 */
var configureFileWatching = function (_on, config) {
    var shouldWatch = !config.env[envVarName];
    config.watchForFileChanges = shouldWatch;
    return config;
};
exports.configureFileWatching = configureFileWatching;
