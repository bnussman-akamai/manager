"use strict";
/**
 * @file Utilities related to accessibility testing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkComponentA11y = void 0;
/**
 * Performs automated Axe accessibility checks against a component.
 *
 * Only applicable to component tests; does not achieve anything when used
 * by an integration test.
 *
 * @param rulesetTag - Axe ruleset tag. Defaults to WCAG 2.2 Level AA rules.
 *
 * @link [axe-core rule tags](https://www.deque.com/axe/core-documentation/api-documentation/#axecore-tags)
 */
var checkComponentA11y = function (rulesetTag) {
    if (rulesetTag === void 0) { rulesetTag = 'wcag22aa'; }
    // Perform checks against component only and not the surrounding HTML.
    var componentContext = '[data-cy-root]';
    cy.injectAxe();
    cy.checkA11y(componentContext, {
        runOnly: {
            type: 'tag',
            values: [rulesetTag],
        },
    });
};
exports.checkComponentA11y = checkComponentA11y;
