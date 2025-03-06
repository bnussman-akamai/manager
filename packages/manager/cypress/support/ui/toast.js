"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toast = void 0;
/**
 * Toast notification UI element.
 */
exports.toast = {
    /**
     * Asserts that a toast notification with the given message is displayed.
     *
     * @param message - Message for the toast being asserted.
     * @param options - Optional Cypress options to find and wait for toast notification.
     *
     * @returns Cypress chainable.
     */
    assertMessage: function (message, options) {
        cy.contains('[aria-describedby="notistack-snackbar"]', message, options).should('be.visible');
    },
    /**
     * Finds a toast notification element by its message contents.
     *
     * Toast notifications are short lived, so actions or assertions should be
     * made as quickly as possible after finding the element.
     *
     * @param message - Message for the toast that should be found.
     * @param options - Optional Cypress options to find and wait for toast notification.
     *
     * @returns Cypress chainable.
     */
    findByMessage: function (message, options) {
        return cy.contains('[aria-describedby="notistack-snackbar"]', message, options);
    },
};
