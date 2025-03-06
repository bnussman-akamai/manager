"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.landingPageEmptyStateResources = void 0;
/**
 * Landing page empty state resources UI element.
 *
 * Useful for checking the content of an empty state landing page. (e.g. /domains with no domains)
 */
exports.landingPageEmptyStateResources = {
    /**
     * Finds the entity header and returns the Cypress chainable.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-placeholder-container="resources-section"]');
    },
};
