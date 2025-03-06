"use strict";
/**
 * @file Script to generate test result summaries from JUnit reports.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var fs = require("fs/promises");
var junit2json_1 = require("junit2json");
var path = require("path");
var github_formatter_1 = require("./formatters/github-formatter");
var json_formatter_1 = require("./formatters/json-formatter");
var slack_formatter_1 = require("./formatters/slack-formatter");
var status_formatter_1 = require("./formatters/status-formatter");
var util_1 = require("./util");
commander_1.program
    .name('junit-summary')
    .description('Outputs test result summary from JUnit reports')
    .version('0.1.0')
    .arguments('<junitPath>')
    .option('-f, --format <str>', 'JUnit summary output format', 'json')
    .option('--meta:title <string>', 'Pipeline title')
    .option('--meta:author-name <str>', 'Author name')
    .option('--meta:author-slack <str>', 'Author Slack name')
    .option('--meta:author-github <str>', 'Author GitHub name')
    .option('--meta:change-id <num>', 'Change PR number')
    .option('--meta:change-url <str>', 'Change PR URL')
    .option('--meta:change-title <str>', 'Change PR title')
    .option('--meta:branch <str>', 'Branch name')
    .option('--meta:run-id <str>', 'CI run ID')
    .option('--meta:run-url <str>', 'CI run URL')
    .option('--meta:artifacts-url <str>', 'CI artifacts URL')
    .option('--meta:results-url <str>', 'CI results URL')
    .option('--meta:rerun-url <str>', 'CI rerun URL')
    .option('--meta:extra <str>', 'Extra information to display in output')
    .action(function (junitPath) {
    return main(junitPath);
});
var isTestSuites = function (data) {
    return !!data.testsuite && !data.testcase;
};
var main = function (junitPath) { return __awaiter(void 0, void 0, void 0, function () {
    var reportPath_1, summaryFormat_1, metadata, reportFiles, loadReportFileContents, junitContents, parseJunitReports, reportData, testSuites, results, failingTests, passingTests, skippedTests, info, formatter, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                reportPath_1 = path.resolve(import.meta.dirname, '..', '..', junitPath);
                summaryFormat_1 = commander_1.program.opts().format;
                metadata = {
                    pipelineTitle: commander_1.program.opts()['meta:title'],
                    authorName: commander_1.program.opts()['meta:authorName'],
                    authorSlack: commander_1.program.opts()['meta:authorSlack'],
                    authorGitHub: commander_1.program.opts()['meta:auhtorGithub'],
                    changeId: commander_1.program.opts()['meta:changeId'],
                    changeUrl: commander_1.program.opts()['meta:changeUrl'],
                    changeTitle: commander_1.program.opts()['meta:changeTitle'],
                    branchName: commander_1.program.opts()['meta:branch'],
                    runId: commander_1.program.opts()['meta:runId'],
                    runUrl: commander_1.program.opts()['meta:runUrl'],
                    artifactsUrl: commander_1.program.opts()['meta:artifactsUrl'],
                    resultsUrl: commander_1.program.opts()['meta:resultsUrl'],
                    rerunUrl: commander_1.program.opts()['meta:rerunUrl'],
                    extra: commander_1.program.opts()['meta:extra'],
                };
                return [4 /*yield*/, fs.readdir(reportPath_1)];
            case 1:
                reportFiles = (_a.sent())
                    .filter(function (dirItem) {
                    return dirItem.endsWith('.xml');
                })
                    .map(function (dirItem) {
                    return path.resolve(reportPath_1, dirItem);
                });
                loadReportFileContents = reportFiles.map(function (reportFile) {
                    return fs.readFile(reportFile, 'utf8');
                });
                return [4 /*yield*/, Promise.all(loadReportFileContents)];
            case 2:
                junitContents = _a.sent();
                parseJunitReports = junitContents.map(function (contents) { return (0, junit2json_1.parse)(contents); });
                return [4 /*yield*/, Promise.all(parseJunitReports)];
            case 3:
                reportData = _a.sent();
                if (!reportData) {
                    throw new Error('Failed to parse JUnit report data');
                }
                testSuites = reportData.reduce(function (acc, cur) {
                    if (!!cur && isTestSuites(cur)) {
                        acc.push(cur);
                    }
                    return acc;
                }, []);
                results = testSuites.reduce(function (acc, cur) {
                    acc.push.apply(acc, (0, util_1.getTestResults)(cur));
                    return acc;
                }, []);
                failingTests = results.filter(function (result) { return result.failing; });
                passingTests = results.filter(function (result) { return result.passing; });
                skippedTests = (0, util_1.getSkippedTestCount)(testSuites);
                info = {
                    rootSuite: 'Root suite name',
                    testSuite: 'Test suite name',
                    time: (0, util_1.getTestLength)(testSuites),
                    tests: results.length + skippedTests,
                    failing: failingTests.length,
                    passing: passingTests.length,
                    skipped: skippedTests,
                };
                formatter = (function () {
                    switch (summaryFormat_1.toLowerCase()) {
                        case 'json':
                            return json_formatter_1.jsonFormatter;
                        case 'slack':
                            return slack_formatter_1.slackFormatter;
                        case 'github':
                            return github_formatter_1.githubFormatter;
                        case 'status':
                            return status_formatter_1.statusFormatter;
                        default:
                            throw new Error("Unknown formatter '".concat(summaryFormat_1, "'."));
                    }
                })();
                console.log(formatter(info, results, metadata, testSuites));
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                console.error('A fatal error has occurred while summarizing test results');
                if (e_1.message) {
                    console.info(e_1.message);
                }
                process.exit(1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
commander_1.program.parse(process.argv);
