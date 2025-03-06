"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestWeights = exports.specWeightsSchema = void 0;
var fs_1 = require("fs");
var luxon_1 = require("luxon");
var path_1 = require("path");
var yup_1 = require("yup");
// The name of the environment variable to read to check if generation is enabled.
// The value should be a path to the weights file.
var envVarName = 'CY_TEST_GENWEIGHTS';
/**
 * Spec weights schema for JSON parsing, etc.
 */
exports.specWeightsSchema = (0, yup_1.object)({
    meta: (0, yup_1.object)({
        datetime: (0, yup_1.string)().required(),
        totalWeight: (0, yup_1.number)().required(),
        totalDuration: (0, yup_1.number)().required(),
    }).required(),
    weights: (0, yup_1.array)((0, yup_1.object)({
        filepath: (0, yup_1.string)().required(),
        duration: (0, yup_1.number)().required(),
        weight: (0, yup_1.number)().required(),
    })).required(),
});
/**
 * Enables test weight generation when `CY_TEST_GENWEIGHTS` is defined.
 *
 * @returns Cypress configuration object.
 */
var generateTestWeights = function (on, config) {
    var specResults = [];
    if (!!config.env[envVarName]) {
        var writeFilepath_1 = config.env[envVarName];
        // Capture duration after each spec runs.
        on('after:spec', function (spec, results) {
            var duration = results.stats.duration;
            if (duration) {
                specResults.push({
                    filepath: spec.relative,
                    duration: duration,
                });
            }
            else {
                console.warn("Failed to record test information for '".concat(spec.relative, "'"));
            }
        });
        // Aggregate spec durations and save as a spec weights JSON file.
        on('after:run', function (results) {
            // Determine whether this is a failed run. "Failed" in this context means
            // that Cypress itself failed to run, not that the test results contained failures.
            var isFailedResult = function (results) {
                return 'failures' in results;
            };
            if (!isFailedResult(results)) {
                var totalWeight_1 = 100;
                var totalDuration_1 = results.totalDuration;
                var weights = {
                    meta: {
                        datetime: luxon_1.DateTime.now().toISO(),
                        totalWeight: totalWeight_1,
                        totalDuration: totalDuration_1,
                    },
                    weights: specResults.map(function (specResult) {
                        return {
                            filepath: specResult.filepath,
                            duration: specResult.duration,
                            weight: (specResult.duration / totalDuration_1) * totalWeight_1,
                        };
                    }),
                };
                var resolvePath = (0, path_1.resolve)(writeFilepath_1);
                (0, fs_1.writeFileSync)(resolvePath, JSON.stringify(weights), 'utf-8');
            }
        });
    }
};
exports.generateTestWeights = generateTestWeights;
