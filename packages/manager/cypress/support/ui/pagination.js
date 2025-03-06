"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagination = void 0;
/**
 * Pagination UI helpers.
 */
exports.pagination = {
    /**
     * Finds the pagination section within a table.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-table-pagination]');
    },
    /**
     * Finds the pagination page selection controls.
     *
     * @returns Cypress chainable.
     */
    findControls: function () {
        return exports.pagination.find().find('[data-qa-pagination-controls]');
    },
    /**
     * Finds the pagination page size selection.
     *
     * @returns Cypress chainable.
     */
    findPageSizeSelect: function () {
        return exports.pagination
            .find()
            .find('[data-qa-pagination-page-size]')
            .find('[role="combobox"]');
    },
};
