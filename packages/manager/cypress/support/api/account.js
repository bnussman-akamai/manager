"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = void 0;
var common_1 = require("./common");
var getProfile = function () {
    return (0, common_1.getAll)('profile');
};
exports.getProfile = getProfile;
