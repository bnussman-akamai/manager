"use strict";
/**
 * @file Constants related to Cypress's handling of LaunchDarkly feature flags.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchDarklyClientstreamPattern = exports.launchDarklyUrlPattern = void 0;
// LaunchDarkly URL pattern for feature flag retrieval.
exports.launchDarklyUrlPattern = 'https://app.launchdarkly.com/sdk/evalx/*/contexts/*';
// LaunchDarkly URL pattern for feature flag / event streaming.
exports.launchDarklyClientstreamPattern = 'https://clientstream.launchdarkly.com/eval/*/*';
