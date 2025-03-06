"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomOCAId = getRandomOCAId;
var oneClickApps_1 = require("src/features/OneClickApps/oneClickApps");
var random_1 = require("support/util/random");
/**
 * Returns the id of a randomly selected oneClickApp
 * @returns number
 */
function getRandomOCAId() {
    // pick a random app
    var appKeys = Object.keys(oneClickApps_1.oneClickApps);
    var index = (0, random_1.randomItem)(appKeys);
    // id should be number, so "+" useful to coerce from string
    var id = +index;
    return id;
}
