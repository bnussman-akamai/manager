"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secondsToTimeString = exports.getTestResults = exports.getSkippedTestCount = exports.getTestLength = void 0;
/**
 * Returns the total length of time for each test suite to run in seconds.
 *
 * @param suites - Array of test suites.
 *
 * @returns Length of time for all suites to run, in seconds.
 */
var getTestLength = function (suites) {
    var unroundedLength = suites.reduce(function (acc, cur) {
        var _a;
        return acc + ((_a = cur.time) !== null && _a !== void 0 ? _a : 0);
    }, 0);
    return Math.round(unroundedLength * 1000) / 1000;
};
exports.getTestLength = getTestLength;
/**
 * Returns the number of skipped tests in the array of `TestSuites` instances.
 *
 * @param suites - Test suites array.
 *
 * @return Number of skipped tests in `suites`.
 */
var getSkippedTestCount = function (suites) {
    return suites.reduce(function (acc, cur) {
        if (cur.testsuite) {
            var skippedTests = cur.testsuite.reduce(function (skipped, currentSuite) {
                if (currentSuite.tests && currentSuite.testcase) {
                    return skipped + (currentSuite.tests - currentSuite.testcase.length);
                }
                return skipped;
            }, 0);
            return acc + skippedTests;
        }
        return acc;
    }, 0);
};
exports.getSkippedTestCount = getSkippedTestCount;
var getTestResults = function (suite) {
    if (!suite.testsuite) {
        return [];
    }
    // The first item in the array contains the 'file' property which refers to
    // the individual spec file.
    var initialSuite = suite.testsuite[0];
    // I'm so sorry.
    var filepath = initialSuite['file'];
    var results = suite.testsuite.reduce(function (acc, cur) {
        if (cur.tests && cur.testcase) {
            var suitename_1 = cur.name;
            var testcases = cur.testcase;
            var results_1 = testcases.map(function (testCase) {
                return {
                    testFilename: filepath,
                    groupName: suitename_1 || '',
                    testName: testCase.classname || '',
                    passing: !testCase.failure,
                    failing: !!testCase.failure,
                };
            });
            acc.push.apply(acc, results_1);
        }
        return acc;
    }, []);
    return results;
};
exports.getTestResults = getTestResults;
/**
 * Returns a string describing the length of time in more human-readable format.
 *
 * @param seconds - Number of seconds.
 *
 * @returns String describing length of time.
 */
var secondsToTimeString = function (seconds) {
    if (seconds <= 60) {
        return "".concat(seconds, "s");
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds - (minutes * 60));
    return "".concat(minutes, "m ").concat(remainingSeconds, "s");
};
exports.secondsToTimeString = secondsToTimeString;
