"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTestTagInfo = void 0;
var tag_1 = require("../util/tag");
var envVarName = 'CY_TEST_TAGS';
var logTestTagInfo = function (_on, config) {
    if (config.env[envVarName]) {
        var query = config.env[envVarName];
        if (!(0, tag_1.validateQuery)(query)) {
            throw "Failed to validate tag query '".concat(query, "'. Please double check the syntax of your query.");
        }
        var rules = (0, tag_1.getQueryRules)(query);
        if (rules.length) {
            console.info("Running tests that satisfy all of the following tag rules for query '".concat(query, "':"));
            console.table((0, tag_1.getHumanReadableQueryRules)(query).reduce(function (acc, cur, index) {
                acc[index] = cur;
                return acc;
            }, {}));
        }
    }
};
exports.logTestTagInfo = logTestTagInfo;
