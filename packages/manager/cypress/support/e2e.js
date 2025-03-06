"use strict";
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/cypress/add-commands");
// Cypress command and assertion setup.
var chai_string_1 = require("chai-string");
require("cypress-axe");
require("cypress-real-events/support");
require("./setup/defer-command");
require("./setup/login-command");
require("./setup/page-visit-tracking-commands");
require("./setup/test-tagging");
chai.use(chai_string_1.default);
chai.use(function (chai, utils) {
    utils.overwriteProperty(chai.Assertion.prototype, 'disabled', function () {
        return function () {
            var obj = utils.flag(this, 'object');
            var isDisabled = Cypress.$(obj).is(':disabled');
            var isAriaDisabled = Cypress.$(obj).attr('aria-disabled') === 'true';
            this.assert(isDisabled || isAriaDisabled, 'expected #{this} to be disabled', 'expected #{this} not to be disabled', undefined);
        };
    });
    utils.overwriteProperty(chai.Assertion.prototype, 'enabled', function () {
        return function () {
            var obj = utils.flag(this, 'object');
            var isDisabled = Cypress.$(obj).is(':disabled');
            var isAriaDisabled = Cypress.$(obj).attr('aria-disabled') === 'true';
            this.assert(!isDisabled && !isAriaDisabled, 'expected #{this} to be enabled', 'expected #{this} not to be enabled', undefined);
        };
    });
});
// Test setup.
var delete_internal_header_1 = require("./setup/delete-internal-header");
var mock_feature_flags_request_1 = require("./setup/mock-feature-flags-request");
var feature_flag_clientstream_1 = require("./setup/feature-flag-clientstream");
var mock_account_request_1 = require("./setup/mock-account-request");
var request_tracking_1 = require("./setup/request-tracking");
(0, request_tracking_1.trackApiRequests)();
(0, mock_account_request_1.mockAccountRequest)();
(0, mock_feature_flags_request_1.mockFeatureFlagRequests)();
(0, feature_flag_clientstream_1.mockFeatureFlagClientstream)();
(0, delete_internal_header_1.deleteInternalHeader)();
