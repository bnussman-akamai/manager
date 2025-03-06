"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
var cypress_1 = require("cypress");
var plugins_1 = require("./cypress/support/plugins");
var configure_browser_1 = require("./cypress/support/plugins/configure-browser");
var configure_file_watching_1 = require("./cypress/support/plugins/configure-file-watching");
var configure_test_suite_1 = require("./cypress/support/plugins/configure-test-suite");
var discard_passed_test_recordings_1 = require("./cypress/support/plugins/discard-passed-test-recordings");
var load_env_config_1 = require("./cypress/support/plugins/load-env-config");
var node_version_check_1 = require("./cypress/support/plugins/node-version-check");
var region_override_check_1 = require("./cypress/support/plugins/region-override-check");
var vite_preprocessor_1 = require("./cypress/support/plugins/vite-preprocessor");
var configure_api_1 = require("./cypress/support/plugins/configure-api");
var fetch_account_1 = require("./cypress/support/plugins/fetch-account");
var fetch_linode_regions_1 = require("./cypress/support/plugins/fetch-linode-regions");
var split_run_1 = require("./cypress/support/plugins/split-run");
var junit_report_1 = require("./cypress/support/plugins/junit-report");
var generate_weights_1 = require("./cypress/support/plugins/generate-weights");
var test_tagging_info_1 = require("./cypress/support/plugins/test-tagging-info");
var vite_config_1 = require("./cypress/vite.config");
var feature_flag_override_1 = require("./cypress/support/plugins/feature-flag-override");
var post_run_cleanup_1 = require("./cypress/support/plugins/post-run-cleanup");
var reset_user_preferences_1 = require("./cypress/support/plugins/reset-user-preferences");
/**
 * Exports a Cypress configuration object.
 *
 * {@link https://docs.cypress.io/guides/references/configuration#Options | Cypress configuration documentation}
 */
exports.default = (0, cypress_1.defineConfig)({
    trashAssetsBeforeRuns: false,
    // Browser configuration.
    chromeWebSecurity: false,
    viewportWidth: 1440,
    viewportHeight: 900,
    // Timeouts.
    requestTimeout: 30000,
    responseTimeout: 80000,
    defaultCommandTimeout: 80000,
    pageLoadTimeout: 60000,
    // Recording and test troubleshooting.
    projectId: '5rhsif',
    screenshotOnRunFailure: true,
    video: true,
    // Only retry test when running via CI.
    retries: process.env['CI'] && !process.env['CY_TEST_DISABLE_RETRIES'] ? 2 : 0,
    experimentalMemoryManagement: true,
    component: {
        devServer: {
            framework: 'react',
            bundler: 'vite',
            viteConfig: vite_config_1.default,
        },
        indexHtmlFile: './cypress/support/component/index.html',
        supportFile: './cypress/support/component/setup.tsx',
        specPattern: './cypress/component/**/*.spec.tsx',
        viewportWidth: 500,
        viewportHeight: 500,
        setupNodeEvents: function (on, config) {
            return (0, plugins_1.setupPlugins)(on, config, [
                load_env_config_1.loadEnvironmentConfig,
                discard_passed_test_recordings_1.discardPassedTestRecordings,
                (0, junit_report_1.enableJunitReport)('Component', true),
            ]);
        },
    },
    e2e: {
        experimentalRunAllSpecs: true,
        // This can be overridden using `CYPRESS_BASE_URL`.
        baseUrl: 'http://localhost:3000',
        // This is overridden when `CY_TEST_SUITE` is defined.
        // See `cypress/support/plugins/configure-test-suite.ts`.
        specPattern: 'cypress/e2e/core/**/*.spec.{ts,tsx}',
        setupNodeEvents: function (on, config) {
            return (0, plugins_1.setupPlugins)(on, config, [
                load_env_config_1.loadEnvironmentConfig,
                node_version_check_1.nodeVersionCheck,
                configure_api_1.configureApi,
                configure_file_watching_1.configureFileWatching,
                configure_test_suite_1.configureTestSuite,
                configure_browser_1.configureBrowser,
                vite_preprocessor_1.vitePreprocess,
                discard_passed_test_recordings_1.discardPassedTestRecordings,
                fetch_account_1.fetchAccount,
                fetch_linode_regions_1.fetchLinodeRegions,
                reset_user_preferences_1.resetUserPreferences,
                region_override_check_1.regionOverrideCheck,
                feature_flag_override_1.featureFlagOverrides,
                test_tagging_info_1.logTestTagInfo,
                split_run_1.splitCypressRun,
                (0, junit_report_1.enableJunitReport)(),
                generate_weights_1.generateTestWeights,
                post_run_cleanup_1.postRunCleanup,
            ]);
        },
    },
});
