"use strict";
/**
 * @file Utilities for handling csv files.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsv = parseCsv;
/**
 * Parses a CSV string and returns an array of objects representing the data.
 *
 * @param {string} csvContent - The CSV content as a string.
 * @returns {any[]} - An array of objects where each object represents a row in the CSV.
 *                    The keys of the objects are the headers from the CSV.
 */
function parseCsv(csvContent) {
    // Split the CSV content into lines and filter out any empty lines
    var lines = csvContent.split('\n').filter(function (line) { return line.trim() !== ''; });
    // Extract the headers from the first line and remove any quotes
    var headers = lines[0]
        .split(',')
        .map(function (header) { return header.trim().replace(/^"|"$/g, ''); });
    // Map the remaining lines to objects using the headers
    return lines.slice(1).map(function (line) {
        var _a;
        // Split each line into values, handling quoted values with commas and embedded quotes
        // The regular expression matches:
        // - Values enclosed in double quotes, which may contain commas and escaped double quotes (e.g., "value, with, commas" or "value with ""embedded"" quotes")
        // - Values not enclosed in double quotes, which are separated by commas
        // The map function then:
        // - Trims any leading or trailing whitespace from each value
        // - Removes the enclosing double quotes from quoted values
        // - Replaces any escaped double quotes within quoted values with a single double quote
        var values = (_a = line
            .match(/("([^"]|"")*"|[^",\s]+)(?=\s*,|\s*$)/g)) === null || _a === void 0 ? void 0 : _a.map(function (value) { return value.trim().replace(/^"|"$/g, '').replace(/""/g, '"'); });
        // Create an object to represent the row
        var entry = {};
        headers.forEach(function (header, index) {
            entry[header] = values ? values[index] : '';
        });
        // Return the object representing the row
        return entry;
    });
}
