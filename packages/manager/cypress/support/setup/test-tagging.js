"use strict";
/**
 * @file Exposes the `tag` util from the `cy` object.
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tag_1 = require("support/util/tag");
var tag_2 = require("support/util/tag");
// Expose tag utils from the `cy` object.
// Similar to `cy.state`, and unlike other functions exposed in `cy`, these do not
// queue Cypress commands. Instead, they modify the test tag map upon execution.
cy.tag = tag_1.tag;
cy.addTag = tag_1.addTag;
var query = (_a = Cypress.env('CY_TEST_TAGS')) !== null && _a !== void 0 ? _a : '';
/**
 *
 */
Cypress.on('test:before:run', function (_test, _runnable) {
    /*
     * Looks for the first command that does not belong in a hook and evalutes tags.
     *
     * Waiting for the first command to begin executing ensures that test context
     * is set up and that tags have been assigned to the test.
     */
    var commandHandler = function () {
        var _a, _b;
        var context = cy.state('ctx');
        if (context && ((_a = context.test) === null || _a === void 0 ? void 0 : _a.type) !== 'hook') {
            var tags = (_b = context === null || context === void 0 ? void 0 : context.tags) !== null && _b !== void 0 ? _b : [];
            if (!(0, tag_2.evaluateQuery)(query, tags)) {
                context.skip();
            }
            Cypress.removeListener('command:start', commandHandler);
        }
    };
    Cypress.on('command:start', commandHandler);
});
