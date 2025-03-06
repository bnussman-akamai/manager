"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubFormatter = void 0;
var pluralize_1 = require("../util/pluralize");
var util_1 = require("../util");
var path = require("path");
var cypress_1 = require("../util/cypress");
var escape_1 = require("../util/escape");
/**
 * Outputs test result summary formatted as a GitHub comment.
 *
 * @param info - Run info.
 * @param results - Test results.
 * @param metadata - Run metadata.
 * @param _junitData - Raw JUnit test result data (unused).
 */
var githubFormatter = function (runInfo, results, metadata, _junitData) {
    var title = !!metadata.pipelineTitle
        ? "## ".concat(metadata.pipelineTitle)
        : null;
    var headline = (function () {
        var headingMarkdown = '### ';
        var description = runInfo.failing
            ? ":small_red_triangle: ".concat(runInfo.failing, " failing ").concat((0, pluralize_1.pluralize)(runInfo.failing, 'test', 'tests'), " on")
            : ":tada: ".concat(runInfo.passing, " passing ").concat((0, pluralize_1.pluralize)(runInfo.passing, 'test', 'tests'), " on");
        // If available, render a link for the run.
        var runLink = (metadata.runId && metadata.runUrl)
            ? "[test run #".concat((0, escape_1.escapeHtmlString)(metadata.runId), " \u2197\uFE0E](").concat((0, escape_1.escapeHtmlString)(metadata.runUrl), ")")
            : 'test run';
        return "".concat(headingMarkdown).concat(description, " ").concat(runLink);
    })();
    var breakdown = [
        '<table>',
        '<thead><tr>',
        '<td><strong>:x: Failing</strong></td>',
        '<td><strong>:white_check_mark: Passing</strong></td>',
        '<td><strong>:arrow_right_hook: Skipped</strong></td>',
        '<td><strong>:clock1: Duration</strong></td>',
        '</tr></thead>',
        '<tbody><tr>',
        "<td><code>".concat(runInfo.failing, " Failing</code></td>"),
        "<td><code>".concat(runInfo.passing, " Passing</code></td>"),
        "<td><code>".concat(runInfo.skipped, " Skipped</code></td>"),
        "<td><code>".concat((0, util_1.secondsToTimeString)(runInfo.time), "</code></td>"),
        '</tr></tbody>',
        '</table>',
        '\n\n',
    ].join('');
    var extra = metadata.extra ? "".concat(metadata.extra, "\n\n") : null;
    var failedTestSummary = (function () {
        var heading = "#### Details";
        var failedTestHeader = "<table><thead><tr><th colspan=\"3\">Failing Tests</th></tr><tr><th></th><th>Spec</th><th>Test</th></tr></thead><tbody>";
        var failedTestRows = results
            .filter(function (result) { return result.failing; })
            .map(function (result) {
            var specFile = path.basename(result.testFilename);
            return "<tr><td>:x:</td><td><code>".concat(specFile, "</code></td><td><em>").concat(result.groupName, " \u00BB ").concat(result.testName, "</em></td></tr>");
        });
        var failedTestFooter = "</tbody></table>";
        return __spreadArray(__spreadArray([
            heading,
            failedTestHeader
        ], failedTestRows, true), [
            failedTestFooter,
            '',
        ], false).join('\n');
    })();
    var rerunNote = (function () {
        var heading = "#### Troubleshooting";
        var failingTestFiles = results
            .filter(function (result) { return result.failing; })
            .map(function (result) { return result.testFilename; });
        var rerunTip = 'Use this command to re-run the failing tests:';
        return [
            heading,
            rerunTip,
            '',
            '```bash',
            (0, cypress_1.cypressRunCommand)(failingTestFiles),
            '```',
            '',
        ].join('\n');
    })();
    return [
        title,
        headline,
        '',
        breakdown,
        extra,
        runInfo.failing > 0 ? failedTestSummary : null,
        runInfo.failing > 0 ? rerunNote : null,
    ]
        .filter(function (item) { return item !== null; })
        .join('\n');
};
exports.githubFormatter = githubFormatter;
