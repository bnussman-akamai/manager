"use strict";
/**
 * @file Utilities for working with currency-related values in Cloud Manager tests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUsd = void 0;
/**
 * Formats the given numeric value as a United States Dollar string.
 *
 * If Cloud implements improved i18n, this function will probably become
 * inadequate. For now, it works well as a naive formatting utility to verify
 * that dollar values are displayed as expected in Cloud Manager's UI.
 *
 * @param num - Number to format.
 *
 * @returns String in USD format.
 */
var formatUsd = function (num) {
    var formatter = new Intl.NumberFormat('en-US', {
        currency: 'USD',
        minimumFractionDigits: 2,
        style: 'currency',
    });
    return formatter.format(num);
};
exports.formatUsd = formatUsd;
