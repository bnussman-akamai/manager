"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regionSelect = exports.autocompletePopper = exports.autocomplete = void 0;
var regions_1 = require("support/util/regions");
/**
 * Returns a regular expression object to match against region select items.
 *
 * This expression accounts for these cases:
 * - Gecko LA is disabled (region ID is present in line with label)
 * - Gecko LA is enabled (region ID is not in line with label, rendered in separate element)
 * - Avoids selecting similarly named regions (e.g. "UK, London" and "UK, London 2")
 *
 * @param region - Region for which to return RegEx.
 *
 * @returns Regular expression object to match menu item of given Region.
 */
// TODO Remove this and use exact string matching once Gecko feature flag is retired.
var getRegionItemRegEx = function (region) {
    return new RegExp("".concat(region.label, "(\\s?\\(").concat(region.id, "\\)|$)"));
};
/**
 * Autocomplete UI element.
 */
exports.autocomplete = {
    /**
     * Finds a autocomplete popper that has the given title.
     */
    find: function () {
        return cy.get('[data-qa-autocomplete] input');
    },
    /**
     * Finds an autocomplete element by its label.
     *
     * @param label - Label of the autocomplete to select.
     *
     * @returns A Cypress chainable object that represents the located element.
     */
    findByLabel: function (label) {
        return cy.get("[data-qa-autocomplete=\"".concat(label, "\"] input"));
    },
};
/**
 * Autocomplete Popper UI element.
 *
 * Useful for validating content, filling out forms, etc. that appear within
 * a autocomplete popper.
 */
exports.autocompletePopper = {
    /**
     * Finds an open autocomplete popper.
     */
    find: function () {
        return cy.document().its('body').find('[data-qa-autocomplete-popper]');
    },
    /**
     * Finds an item within an autocomplete popper that has the given title.
     */
    findByTitle: function (title, options) {
        return (cy
            .document()
            .its('body')
            .find('[data-qa-autocomplete-popper]')
            .findByText(title, options)
            // Scroll to the desired item before yielding.
            // Apply a negative top offset to account for cases where the desired
            // item may be obscured by the drop-down sticky category heading.
            .scrollIntoView({ offset: { left: 0, top: -45 } }));
    },
};
/**
 * UI helpers for region selection Autocomplete.
 */
exports.regionSelect = {
    /**
     * Finds a region select input.
     *
     * This finds any element with the `region-select` test ID. In cases where
     * more than one region select may be on the screen, consider narrowing
     * your selection before using this helper.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-testid="region-select"] input');
    },
    /**
     * Finds a region select input by its current value.
     *
     * @param selectedRegion - Current selection for desired Region Select.
     *
     * @returns Cypress chainable.
     */
    findBySelectedItem: function (selectedRegion) {
        return cy.get("[value=\"".concat(selectedRegion, "\"]"));
    },
    /**
     * Finds a Region Select menu item using the ID of a region.
     *
     * This assumes that the Region Select menu is already open.
     *
     * @param regionId - ID of region to find in selection drop-down.
     * @param searchRegions - Optional array of regions from which to search.
     *
     * @returns Cypress chainable.
     */
    findItemByRegionId: function (regionId, searchRegions) {
        var region = (0, regions_1.getRegionById)(regionId, searchRegions);
        return exports.autocompletePopper.findByTitle(getRegionItemRegEx(region));
    },
    /**
     * Finds a Region Select menu item using a region's label.
     *
     * This assumes that the Region Select menu is already open.
     *
     * @param regionLabel - Label of region to find in selection drop-down.
     * @param searchRegions - Optional array of regions from which to search.
     *
     * @returns Cypress chainable.
     */
    findItemByRegionLabel: function (regionLabel, searchRegions) {
        var region = (0, regions_1.getRegionByLabel)(regionLabel, searchRegions);
        return exports.autocompletePopper.findByTitle(getRegionItemRegEx(region));
    },
};
