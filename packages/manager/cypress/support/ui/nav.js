"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nav = void 0;
/**
 * Main sidebar navigation UI element.
 */
exports.nav = {
    /**
     * Finds the main sidebar navigation element.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('#main-navigation');
    },
    /**
     * Finds a sidebar navigation item by its title.
     *
     * @param title - Title of sidebar navigation item to find.
     *
     * @returns Cypress chainable.
     */
    findItemByTitle: function (title) {
        return cy.get('#main-navigation').findByText(title).closest('a');
    },
    /**
     * Finds the main sidebar navigation toggle button.
     *
     * @returns Cypress chainable.
     */
    findToggleButton: function () {
        return cy.findByTestId('open-nav-menu');
    },
};
