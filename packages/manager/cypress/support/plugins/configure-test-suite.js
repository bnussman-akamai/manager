"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTestSuite = void 0;
// The name of the environment variable to read when checking suite configuration.
var envVarName = 'CY_TEST_SUITE';
/**
 * Overrides the Cypress test suite according to `CY_TEST_SUITE` environment variable.
 *
 * If `CY_TEST_SUITE` is undefined or invalid, the 'core' test suite will be run
 * by default.
 *
 * The resolved test suite name can be read by tests and other plugins via
 * `Cypress.env('cypress_test_suite')`.
 *
 * @returns Cypress configuration object.
 */
var configureTestSuite = function (_on, config) {
    var suiteName = (function () {
        switch (config.env[envVarName]) {
            case 'synthetic':
                return 'synthetic';
            case 'core':
            default:
                if (!!config.env[envVarName] && config.env[envVarName] !== 'core') {
                    var desiredSuite = config.env[envVarName];
                    console.warn("Unknown test suite '".concat(desiredSuite, "'. Running 'core' test suite instead."));
                }
                return 'core';
        }
    })();
    config.env['cypress_test_suite'] = suiteName;
    config.specPattern = "cypress/e2e/".concat(suiteName, "/**/*.spec.{ts,tsx}");
    return config;
};
exports.configureTestSuite = configureTestSuite;
