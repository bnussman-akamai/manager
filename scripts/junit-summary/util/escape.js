"use strict";
/**
 * @file String escaping and sanitization utilities for various output formats.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtmlString = void 0;
/**
 * Escapes a string intended for HTML output.
 *
 * @param str - String to escape.
 *
 * @returns String escaped for HTML output.
 */
var escapeHtmlString = function (str) {
    // Adapted from https://stackoverflow.com/a/30970751
    var lookup = {
        '&': "&amp;",
        '"': "&quot;",
        '\'': "&apos;",
        '<': "&lt;",
        '>': "&gt;"
    };
    return str.replace(/[&"'<>]/g, function (c) { return lookup[c]; });
};
exports.escapeHtmlString = escapeHtmlString;
