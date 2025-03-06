"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.breadcrumb = void 0;
/**
 * Breadcrumb UI element.
 *
 * Useful for performing navigation and validating navigation display.
 */
exports.breadcrumb = {
    /**
     * Finds a breadcrumb element.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-breadcrumb]');
    },
};
