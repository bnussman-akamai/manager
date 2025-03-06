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
exports.slackFormatter = void 0;
var pluralize_1 = require("../util/pluralize");
var util_1 = require("../util");
var path = require("path");
var cypress_1 = require("../util/cypress");
/**
 * The maximum number of failures that will be listed in the Slack notification.
 *
 * The Slack notification has a maximum character limit, so we must truncate
 * the failure results to reduce the risk of hitting that limit.
 */
var FAILURE_SUMMARY_LIMIT = 4;
/**
 * Outputs test result summary formatted as a Slack message.
 *
 * @param info - Run info.
 * @param results - Test results.
 * @param metadata - Run metadata.
 * @param _junitData - Raw JUnit test result data (unused).
 */
var slackFormatter = function (runInfo, results, metadata, _junitData) {
    var indicator = runInfo.failing ? ':x-mark:' : ':check-mark:';
    var headline = metadata.pipelineTitle
        ? "*".concat(metadata.pipelineTitle, "*\n")
        : '*Cypress test results*\n';
    var prInfo = (metadata.changeId && metadata.changeUrl && metadata.changeTitle)
        ? ":pull-request: ".concat(metadata.changeTitle, " (<").concat(metadata.changeUrl, "|#").concat(metadata.changeId, ">)\n")
        : null;
    var breakdown = ":small_red_triangle: ".concat(runInfo.failing, " Failing | :thumbs_up_green: ").concat(runInfo.passing, " Passing | :small_blue_diamond: ").concat(runInfo.skipped, " Skipped\n\n");
    // Show a human-readable summary of what was tested and whether it succeeded.
    var summary = (function () {
        var statusInfo = !runInfo.failing
            ? "> ".concat(indicator, " ").concat(runInfo.passing, " passing ").concat((0, pluralize_1.pluralize)(runInfo.passing, 'test', 'tests'))
            : "> ".concat(indicator, " ").concat(runInfo.failing, " failed ").concat((0, pluralize_1.pluralize)(runInfo.failing, 'test', 'tests'));
        var buildInfo = (metadata.runId && metadata.runUrl)
            ? " on run <".concat(metadata.runUrl, "|#").concat(metadata.runId, ">")
            : '';
        var runLength = "(".concat((0, util_1.secondsToTimeString)(runInfo.time), ")");
        var endingPunctuation = !runInfo.failing ? '.' : ':';
        return "".concat(statusInfo).concat(buildInfo, " ").concat(runLength).concat(endingPunctuation);
    })();
    // Display a list of failed tests and collection of actions when applicable.
    var failedTestSummary = (function () {
        var failedTestLines = results
            .filter(function (result) { return result.failing; })
            .slice(0, FAILURE_SUMMARY_LIMIT)
            .map(function (result) {
            var specFile = path.basename(result.testFilename);
            return "\u2022 `".concat(specFile, "` \u2014 _").concat(result.groupName, "_ \u00BB _").concat(result.testName, "_");
        });
        var remainingFailures = runInfo.failing - FAILURE_SUMMARY_LIMIT;
        var truncationNote = (runInfo.failing > FAILURE_SUMMARY_LIMIT)
            ? "and ".concat(remainingFailures, " more ").concat((0, pluralize_1.pluralize)(remainingFailures, 'failure', 'failures'), "...\n")
            : null;
        // When applicable, display actions that can be taken by the user.
        var failedTestActions = [
            metadata.resultsUrl ? "<".concat(metadata.resultsUrl, "|View results>") : '',
            metadata.artifactsUrl ? "<".concat(metadata.artifactsUrl, "|View artifacts>") : '',
            metadata.rerunUrl ? "<".concat(metadata.rerunUrl, "|Replay tests>") : '',
        ]
            .filter(function (item) { return item !== ''; })
            .join(' | ');
        return __spreadArray(__spreadArray([
            ''
        ], failedTestLines, true), [
            truncationNote,
            '',
            failedTestActions ? failedTestActions : null,
        ], false).filter(function (item) { return item !== null; })
            .map(function (item) { return "> ".concat(item); })
            .join('\n');
    })();
    // Display re-run command to help with troubleshooting.
    var rerunNote = (function () {
        var failingTestFiles = results
            .filter(function (result) { return result.failing; })
            .map(function (result) { return result.testFilename; });
        var rerunTip = 'Use this command to re-run the failing tests:';
        var cypressCommand = "".concat('```').concat((0, cypress_1.cypressRunCommand)(failingTestFiles)).concat('```');
        return "".concat(rerunTip, "\n").concat(cypressCommand);
    })();
    var extra = metadata.extra ? "".concat(metadata.extra, "\n") : null;
    // Display test run details (author, PR number, run number, etc.) when applicable.
    var footer = (function () {
        var authorIdentifier = (metadata.authorSlack ? "@".concat(metadata.authorSlack) : null)
            || (metadata.authorGitHub ? "<https://github.com/".concat(metadata.authorGitHub, "|").concat(metadata.authorGitHub, ">") : null)
            || (metadata.authorName ? metadata.authorName : null);
        return [
            authorIdentifier ? "Authored by ".concat(authorIdentifier) : null,
            metadata.changeId && metadata.changeUrl ? "PR <".concat(metadata.changeUrl, "|#").concat(metadata.changeId, ">") : null,
            metadata.runId && metadata.runUrl ? "Run <".concat(metadata.runUrl, "|#").concat(metadata.runId, ">") : null,
            metadata.branchName ? "`".concat(metadata.branchName, "`") : null,
        ]
            .filter(function (item) { return item !== null; })
            .join(' | ');
    })();
    return [
        headline,
        prInfo,
        breakdown,
        summary,
        // Add an extra line after the summary when no failures are listed.
        runInfo.failing > 0 ? null : '',
        // When one or more test has failed, display the list of failed tests as
        // well as a command that can be used to re-run failed tests locally.
        runInfo.failing > 0 ? "".concat(failedTestSummary, "\n") : null,
        runInfo.failing > 0 ? "".concat(rerunNote, "\n") : null,
        // If extra information has been supplied, display it above the footer.
        extra,
        // Show run details footer.
        ":cypress: ".concat(footer),
    ].filter(function (item) { return item !== null; }).join('\n');
};
exports.slackFormatter = slackFormatter;
