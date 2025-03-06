"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skip = void 0;
/**
 * Skips the running test.
 */
var skip = function () {
    // `cy.state()` is intended to be used by Cypress internally, and the API
    // is not guaranteed to be stable.
    //
    // Implementation taken from `cypress-skip-test`:
    // https://github.com/cypress-io/cypress-skip-test
    //
    var mochaContext = cy.state('runnable').ctx;
    return mochaContext.skip();
};
exports.skip = skip;
