"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusFormatter = void 0;
/**
 * Outputs "passing" if all tests have passed, or "failing" if one or more has failed.
 *
 * @param info - Run info.
 */
var statusFormatter = function (info) {
    return info.failing ? 'failing' : 'passing';
};
exports.statusFormatter = statusFormatter;
