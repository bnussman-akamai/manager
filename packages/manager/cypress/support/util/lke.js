"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestKubernetesVersion = void 0;
var sort_by_1 = require("src/utilities/sort-by");
/**
 * Returns the string of the highest semantic version.
 */
var getLatestKubernetesVersion = function (versions) {
    var sortedVersions = versions.sort(function (a, b) {
        return (0, sort_by_1.sortByVersion)(a, b, 'asc');
    });
    var latestVersion = sortedVersions.pop();
    if (!latestVersion) {
        // Return an empty string if sorting does not yield latest version
        return '';
    }
    return latestVersion;
};
exports.getLatestKubernetesVersion = getLatestKubernetesVersion;
