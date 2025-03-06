"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMenu = exports.userMenuButton = void 0;
/**
 * User menu button UI element.
 *
 * Present in the page heading on all pages, and is useful for opening the user
 * menu.
 */
exports.userMenuButton = {
    /**
     * Finds the user menu button and returns the Cypress chainable.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get("button[aria-label=\"Profile & Account\"]");
    },
};
/**
 * User menu popover UI element.
 *
 * Becomes visible upon clicking the user menu button, and is useful for navigating to
 * account- or profile-related pages.
 */
exports.userMenu = {
    /**
     * Finds the user menu popover and returns the Cypress chainable.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('#user-menu-popover');
    },
};
