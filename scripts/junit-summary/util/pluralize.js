"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluralize = void 0;
/**
 * Returns a singular or plural version of a string given a number of values.
 *
 * @param itemCount - Number of items used to determine output.
 * @param singular - Singular string output.
 * @param plural - Plural string output.
 *
 * @returns Singular or plural string output for `itemCount` item(s).
 */
var pluralize = function (itemCount, singular, plural) {
    return (itemCount === 1 ? singular : plural);
};
exports.pluralize = pluralize;
