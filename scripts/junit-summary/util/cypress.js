"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cypressRunCommand = void 0;
/**
 * Generates a Cypress run command to run the given test files.
 *
 * @param testFiles - Array of test filepaths.
 *
 * @returns Cypress run command to run `testFiles`.
 */
var cypressRunCommand = function (testFiles) {
    var dedupedTestFiles = Array.from(new Set(testFiles));
    var testFilesList = dedupedTestFiles.join(',');
    return "pnpm cy:run -s \"".concat(testFilesList, "\"");
};
exports.cypressRunCommand = cypressRunCommand;
