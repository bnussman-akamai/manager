"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeVersionCheck = void 0;
// Supported major versions of Node.js.
// Running Cypress using other versions will cause a warning to be displayed.
var supportedVersions = [18, 20];
/**
 * Returns a string describing the version of Node.js that is running the tests.
 *
 * @example
 * getVersionString(); // '18.14.1'.
 *
 * @returns String describing Node.js version.
 */
var getVersionString = function () {
    return process.version.substring(1, process.version.length);
};
/**
 * Returns an object describing each component of a version string.
 *
 * @returns Object describing a version string.
 */
var getVersionComponents = function (versionString) {
    var versionComponentsArray = versionString
        .split('.')
        .map(function (str) { return parseInt(str, 10); });
    return {
        full: versionString,
        major: versionComponentsArray[0],
        minor: versionComponentsArray[1],
        patch: versionComponentsArray[2],
    };
};
/**
 * Displays a warning if tests are running on an unsupported version of Node JS.
 */
var nodeVersionCheck = function (_on, _config) {
    var version = getVersionComponents(getVersionString());
    if (!supportedVersions.includes(version.major)) {
        console.warn("You are running Node v".concat(version.full, ". Only the following versions of Node are supported:"));
        supportedVersions.forEach(function (supportedVersion) {
            console.warn("  - v".concat(supportedVersion, ".x"));
        });
    }
};
exports.nodeVersionCheck = nodeVersionCheck;
