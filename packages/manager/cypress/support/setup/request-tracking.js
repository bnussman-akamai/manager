"use strict";
/**
 * @file Tracks the number of Linode APIv4 requests being made during each test.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackApiRequests = void 0;
// TODO Examine whether tracking API v4 request tracking is useful or can be made to be useful.
// The number of Linode APIvr requests that are allowed.
// Set to `null` to allow any number of APIv4 requests.
var maxRequests = null;
// Whether a test should fail immediately upon passing `maxRequests` threshold.
// If `false`, the test will continue running but will fail upon finishing.
var failImmediately = false;
// Whether or not to report the APIv4 request count at the end of a test.
var reportRequestCount = true;
var makeErrorString = function (requests, max) {
    return "Excessive Linode APIv4 requests were detected, causing this test to fail.\n\nAPIv4 requests: ".concat(requests, "\nMaximum requests: ").concat(max);
};
var trackApiRequests = function () {
    // Set up Linode APIv4 intercepts and set default alias value.
    beforeEach(function () {
        var requests = 0;
        cy.wrap([]).as('linodeApiV4Request');
        cy.intercept({
            middleware: true,
            url: /\/v4(?:beta)?\/.*/,
        }, function () {
            requests++;
            // Short-circuit if `maxRequests` is null.
            if (maxRequests === null) {
                return;
            }
            // Fail test if API threshold is met and `failImmediately` is true.
            if (requests > maxRequests && failImmediately) {
                throw new Error(makeErrorString(requests, maxRequests));
            }
        }).as('linodeApiV4Request');
    });
    // Tally and report intercepted Linode APIv4 requests, failing test if necessary.
    afterEach(function () {
        cy.get('@linodeApiV4Request.all').then(function (calls) {
            var count = calls.length;
            if (reportRequestCount) {
                cy.log("".concat(count, " Linode APIv4 requests were made during this test"));
            }
            if (maxRequests !== null && count > maxRequests) {
                throw new Error(makeErrorString(count, maxRequests));
            }
        });
    });
};
exports.trackApiRequests = trackApiRequests;
