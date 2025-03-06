"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonFormatter = void 0;
/**
 * Outputs test result data in JSON format.
 *
 * @param info - Run info.
 * @param results - Test results.
 * @param metadata - Run metadata.
 * @param _junitData - Raw JUnit test result data (unused).
 */
var jsonFormatter = function (info, results, metadata, _junitData) {
    return JSON.stringify({
        info: info,
        metadata: metadata,
        results: results,
    });
};
exports.jsonFormatter = jsonFormatter;
