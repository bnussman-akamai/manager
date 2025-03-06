"use strict";
/**
 * @file Utilities related to array handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDuplicates = exports.shuffleArray = exports.buildArray = void 0;
/**
 * Builds an array of the given length using the given builder function.
 *
 * @param length - Length of array to create.
 * @param builder - Function that creates an array item for the given index.
 *
 * @returns Created array.
 */
var buildArray = function (length, builder) {
    return new Array(length)
        .fill(null)
        .map(function (_item, i) { return builder(i); });
};
exports.buildArray = buildArray;
/**
 * Returns a copy of an array with its items sorted randomly.
 *
 * @param unsortedArray - Array to shuffle.
 *
 * @returns Copy of `unsortedArray` with its items sorted randomly.
 */
var shuffleArray = function (unsortedArray) {
    return unsortedArray
        .map(function (value) { return ({ value: value, sort: Math.random() }); })
        .sort(function (a, b) { return a.sort - b.sort; })
        .map(function (_a) {
        var value = _a.value;
        return value;
    });
};
exports.shuffleArray = shuffleArray;
/**
 * Returns a copy of an array with duplicate items removed.
 *
 * @param array - Array from which to create de-duplicated array.
 *
 * @returns Copy of `array` with duplicate items removed.
 */
var removeDuplicates = function (array) {
    return Array.from(new Set(array));
};
exports.removeDuplicates = removeDuplicates;
