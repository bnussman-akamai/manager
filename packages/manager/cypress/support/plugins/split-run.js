"use strict";
/**
 * @file Allows parallelization without Cypress Cloud.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.splitCypressRun = void 0;
var glob_1 = require("glob");
var path_1 = require("path");
var fs_1 = require("fs");
var generate_weights_1 = require("./generate-weights");
/**
 * Divides a run between separate Cypress processes.
 *
 * Optionally, a test weights file may be specified to optimize test distribution
 * among runners.
 */
var splitCypressRun = function (_on, config) {
    var _a = config.env, splitRunEnabled = _a.CY_TEST_SPLIT_RUN, splitRunTotalRunners = _a.CY_TEST_SPLIT_RUN_TOTAL, splitRunRunnerIndex = _a.CY_TEST_SPLIT_RUN_INDEX, splitRunWeightsPath = _a.CY_TEST_SPLIT_RUN_WEIGHTS;
    // Short-circuit if split running is not enabled.
    // In this case, return an unmodified config object.
    if (!splitRunEnabled) {
        return config;
    }
    // If split running is enabled, total and index must be defined.
    // Otherwise, we'll throw an error that will be displayed to the user.
    if (!splitRunTotalRunners || !splitRunRunnerIndex) {
        throw new Error('CY_TEST_SPLIT_RUN is enabled, but CY_TEST_SPLIT_RUN_TOTAL and CY_TEST_SPLIT_RUN_INDEX are not defined.');
    }
    if (isNaN(splitRunTotalRunners) || isNaN(splitRunRunnerIndex)) {
        throw new Error('CY_TEST_SPLIT_RUN_TOTAL and CY_TEST_SPLIT_RUN_INDEX must be numeric.');
    }
    var totalRunners = parseInt(splitRunTotalRunners, 10);
    var runner = parseInt(splitRunRunnerIndex, 10);
    // Override configuration spec pattern to reflect test subset for this runner...
    var specs = (0, glob_1.globSync)(config.specPattern);
    var totalWeight = 0;
    var weightedSpecs = [];
    var unweightedSpecs = __spreadArray([], specs, true);
    // If spec weights file path is specified, attempt to read its contents.
    // If weights file does not exist, is inaccessible, or is malformed, weights
    // data will be discarded and run splitting will fall back on round-robin
    // distribution method.
    if (splitRunWeightsPath) {
        try {
            var specWeights = readTestWeightsFile(splitRunWeightsPath);
            weightedSpecs = getWeightedSpecs(specs, specWeights);
            unweightedSpecs = getUnweightedSpecs(specs, specWeights);
            totalWeight = specWeights.meta.totalWeight;
        }
        catch (err) {
            // Swallow error here; it's OK if test weights file doesn't exist / can't be read.
            // Wrap messages in IIFEs to avoid issue where info messages get printed first.
            (function () {
                console.warn("Failed to read weights file at '".concat(splitRunWeightsPath, "'"));
                if ('message' in err) {
                    console.warn("Error message: ".concat(err.message));
                }
            })();
            (function () {
                console.info('You can optimize your CI run performance by generating a valid weights file');
                console.info("Example: CY_TEST_GENWEIGHTS='".concat(splitRunWeightsPath, "' pnpm cy:run"));
            })();
        }
    }
    // Distribute specs based on their weights and get an array of weighted specs
    // for this runner.
    var weightedSpecsForRunner = getWeightedRunnerSpecs(runner, totalRunners, weightedSpecs);
    // Distribute remaining unweighted specs round-robin style, if applicable.
    // Sort spec filenames as deterministically as we easily can.
    unweightedSpecs.sort(function (a, b) {
        if (a.toLowerCase() < b.toLowerCase()) {
            return -1;
        }
        else if (a.toLowerCase() > b.toLowerCase()) {
            return 1;
        }
        return 0;
    });
    config.specPattern = __spreadArray(__spreadArray([], weightedSpecsForRunner.specs, true), unweightedSpecs.filter(function (_spec, index) {
        return (index + runner - 1) % totalRunners === 0;
    }), true);
    var splitRunInfo = {
        '# of Specs Total': specs.length,
        '# of Specs for This Run': config.specPattern.length,
        Runner: runner,
        'Total Runners': totalRunners,
    };
    var weightsInfo = (function () {
        if (weightedSpecs.length < 1) {
            return {
                'Test Weights': 'Unavailable',
            };
        }
        return {
            'Test Weights': splitRunWeightsPath,
            'Total Test Weight': "".concat(Math.round(totalWeight * 100) / 100, "%"),
            'Runner Test Weight': "".concat(Math.round(weightedSpecsForRunner.weight * 100) / 100, "%"),
            'Weighted Specs': weightedSpecs.length,
            'Unweighted Specs': unweightedSpecs.length,
        };
    })();
    console.info('Cypress split running is enabled.');
    console.table(__assign(__assign({}, splitRunInfo), weightsInfo));
    return config;
};
exports.splitCypressRun = splitCypressRun;
/**
 * Reads a test weights file at the given path and returns its data.
 *
 * Weights data is sorted from highest to lowest weight.
 *
 * @param weightsFilepath - Path to weights file.
 *
 * @throws If `weightsFilepath` does not exist or is not readable.
 * @throws If weights data is invalid.
 *
 * @returns Spec weights data.
 */
var readTestWeightsFile = function (weightsFilepath) {
    var weightsContents = (0, fs_1.readFileSync)((0, path_1.resolve)(weightsFilepath), 'utf-8');
    var weightsData = JSON.parse(weightsContents);
    generate_weights_1.specWeightsSchema.validateSync(weightsData);
    // Sort spec weights from highest weight to lowest.
    weightsData.weights.sort(function (a, b) { return b.weight - a.weight; });
    return weightsData;
};
/**
 * Returns an array of `SpecWeight` objects for each spec file with corresponding weight data.
 *
 * @param allSpecs - String of spec filepaths for this run.
 * @param specWeights - Spec weights data.
 *
 * @returns Array of `SpecWeight` objects for each spec file that has weight data.
 */
var getWeightedSpecs = function (allSpecs, specWeights) {
    return allSpecs
        .map(function (specPath) {
        return specWeights.weights.find(function (specWeight) { return specWeight.filepath === specPath; });
    })
        .filter(function (specWeight) { return !!specWeight; });
};
/**
 * Returns an array of spec filepaths for each spec file that does not have weight data.
 *
 * @param allSpecs - String of spec filepaths for this run.
 * @param specWeights - Spec weights data.
 *
 * @returns Array of spec filepaths for each spec file that does not have corresponding weight data.
 */
var getUnweightedSpecs = function (allSpecs, specWeights) {
    return allSpecs.filter(function (specPath) {
        return !specWeights.weights.find(function (specWeight) { return specWeight.filepath === specPath; });
    });
};
/**
 * Returns weighted specs for a single runner in a split run.
 *
 * @param runnerIndex - Index of the runner for which to retrieve specs.
 * @param totalRunners - Total number of runners.
 * @param weightedSpecs - Weighted spec data from which to retrieve specs.
 *
 * @returns Weighted specs for runner with index `runnerIndex`.
 */
var getWeightedRunnerSpecs = function (runnerIndex, totalRunners, weightedSpecs) {
    var weightSimulationResults = Array.from({ length: totalRunners }, function () { return ({
        specs: [],
        weight: 0,
    }); });
    weightedSpecs.forEach(function (weightedSpec) {
        // Ensure lowest weighed runner is at index 0.
        weightSimulationResults.sort(function (a, b) { return a.weight - b.weight; });
        weightSimulationResults[0].specs.push(weightedSpec.filepath);
        weightSimulationResults[0].weight += weightedSpec.weight;
    });
    return weightSimulationResults[runnerIndex - 1];
};
