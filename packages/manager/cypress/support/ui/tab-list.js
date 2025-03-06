"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabList = void 0;
/**
 * Tab list UI element.
 */
exports.tabList = {
    /**
     * Finds a tab list.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-reach-tab-list]');
    },
    /**
     * Finds a tab within a tab list by its title.
     *
     * @param tabTitle - Title of tab to find.
     * @param options - Selector matcher options.
     *
     * @returns Cypress chainable.
     */
    findTabByTitle: function (tabTitle, options) {
        return cy.get('[data-reach-tab-list]').findByText(tabTitle, options);
    },
};
