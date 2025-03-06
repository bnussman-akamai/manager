"use strict";
/**
 * @file Utilities related to random string and number generation.
 */
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
exports.randomHex = exports.randomUuid = exports.randomPhrase = exports.randomPhoneNumber = exports.randomIp = exports.randomDomainName = exports.randomLabel = exports.randomString = exports.randomItem = exports.randomNumber = void 0;
var cypress_1 = require("support/constants/cypress");
// Default options for random string generation.
var defaultRandomStringOptions = {
    lowercase: true,
    numbers: true,
    spaces: false,
    symbols: false,
    uppercase: true,
};
/**
 * Generates a random number within a range.
 *
 * Unless specified, the returned number is between 0 and 100.
 *
 * @param min - Inclusive minimum for random number. Default `0`.
 * @param max - Inclusive maximum for random number. Default `100`.
 *
 * @returns Random number between `min` and `max`.
 */
var randomNumber = function (min, max) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 100; }
    var scaleMultiplier = max - min;
    return min + Math.round(Math.random() * scaleMultiplier);
};
exports.randomNumber = randomNumber;
/**
 * Returns a random item from an array.
 *
 * @param array - Array from which to retrieve random item.
 *
 * @returns Random item from array `array`.
 */
var randomItem = function (array) {
    var index = (0, exports.randomNumber)(0, array.length - 1);
    return array[index];
};
exports.randomItem = randomItem;
/**
 * Returns a random string of the given length.
 *
 * An options object may be passed to configure the random string.
 *
 * @param length - String length. Default `8`.
 *
 * @returns Random string.
 */
var randomString = function (length, options) {
    if (length === void 0) { length = 8; }
    var stringOptions = options ? options : defaultRandomStringOptions;
    var alphaLowercase = 'abcdefghijklmnopqrstuvwxyz';
    var alphaUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var numbers = '1234567890';
    var symbols = '!@#$%^&*()[]-_.,<>/?`~';
    var spaces = ' ';
    var characterSelection = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], (stringOptions.lowercase ? [alphaLowercase] : []), true), (stringOptions.uppercase ? [alphaUppercase] : []), true), (stringOptions.numbers ? [numbers] : []), true), (stringOptions.symbols ? [symbols] : []), true), (stringOptions.spaces ? [spaces] : []), true).join('')
        .split('');
    var output = '';
    for (var i = 0; i < length; i++) {
        output += (0, exports.randomItem)(characterSelection);
    }
    return output;
};
exports.randomString = randomString;
/**
 * Creates a random label that has a test entity prefix.
 *
 * @example
 * // Assumes that test entity prefix is `cy-test-`.
 * randomLabel(); // Example output: `cy-test-prcxfnmafe`
 * randomLabel(5); // Example output: `cy-test-bkwpo`
 *
 * @param length - Length of random label, not including length of test entity prefix.
 *
 * @returns Random test label.
 */
var randomLabel = function (length) {
    if (length === void 0) { length = 10; }
    var randomStringOptions = {
        lowercase: true,
        numbers: false,
        spaces: false,
        symbols: false,
        uppercase: false,
    };
    return "".concat(cypress_1.entityPrefix).concat((0, exports.randomString)(length, randomStringOptions));
};
exports.randomLabel = randomLabel;
/**
 * Creates a random domain name that has a test entity prefix.
 *
 * @example
 * // Assumes that test entity prefix is `cy-test-`.
 * randomDomain(); // Example output: `cy-test-prcxfnmafe.com`
 * randomDomain(5); // Example output: `cy-test-bkwpo.net`
 *
 * @param length - Length of random domain name, not including length of test entity prefix or TLD.
 *
 * @returns Random domain name.
 */
var randomDomainName = function (length) {
    if (length === void 0) { length = 10; }
    var tlds = ['net', 'com', 'org'];
    return "".concat((0, exports.randomLabel)(length), ".").concat((0, exports.randomItem)(tlds));
};
exports.randomDomainName = randomDomainName;
/**
 * Returns a random IPv4 address.
 *
 * @example
 * randomIp(); // Example output: `3.196.83.89`
 *
 * @returns Random IPv4 address.
 */
var randomIp = function () {
    var randomOctet = function () { return (0, exports.randomNumber)(0, 254); };
    return "".concat(randomOctet(), ".").concat(randomOctet(), ".").concat(randomOctet(), ".").concat(randomOctet());
};
exports.randomIp = randomIp;
/**
 * Returns a random phone number.
 *
 * The three digits following the area code will always be '555'.
 *
 * @param randomCountryCode - Whether country code should be random. If not, '1' is used.
 *
 * @example
 * randomPhoneNumber(); // Example output: `+19965551794`.
 * randomPhoneNumber(false); // Equivalent to above.
 * randomPhoneNumber(true); // Example output: `+2642285555485`.
 *
 * @returns Random phone number.
 */
var randomPhoneNumber = function (randomCountryCode) {
    if (randomCountryCode === void 0) { randomCountryCode = false; }
    var countryCode = randomCountryCode ? (0, exports.randomNumber)(1, 999) : 1;
    return "+".concat(countryCode).concat((0, exports.randomNumber)(100, 999), "555").concat((0, exports.randomNumber)(1000, 9999));
};
exports.randomPhoneNumber = randomPhoneNumber;
/**
 * Returns a random phrase of random strings.
 *
 * @param count - Number of strings to include in phrase.
 *
 * @returns Random phrase.
 */
var randomPhrase = function (count) {
    if (count === void 0) { count = 5; }
    return __spreadArray([], Array(count), true).map(function () {
        var length = (0, exports.randomNumber)(3, 9);
        return (0, exports.randomString)(length, {
            lowercase: true,
            numbers: false,
            spaces: false,
            symbols: false,
            uppercase: false,
        });
    })
        .join(' ');
};
exports.randomPhrase = randomPhrase;
/**
 * Generates a random string which resembles a v4 UUID.
 *
 * This does not generate a valid UUID, nor does it offer the same guarantees as
 * a UUID. Instead, it is intended to be used when generating values for mocks
 * or when filling in fields which expect UUID values.
 *
 * @returns Random string which resembles a v4 UUID.
 */
var randomUuid = function () {
    var randomStringOptions = {
        lowercase: false,
        numbers: true,
        spaces: false,
        symbols: false,
        uppercase: true,
    };
    return [
        (0, exports.randomString)(8, randomStringOptions),
        (0, exports.randomString)(4, randomStringOptions),
        (0, exports.randomString)(4, randomStringOptions),
        (0, exports.randomString)(4, randomStringOptions),
        (0, exports.randomString)(12, randomStringOptions),
    ].join('-');
};
exports.randomUuid = randomUuid;
/**
 * Returns a random hexadecimal string of a given length.
 *
 * @param length - Length of the hexadecimal string.
 *
 * @returns Random hexadecimal string.
 */
var randomHex = function (length) {
    if (length === void 0) { length = 64; }
    var hexNumber = '0123456789abcdef';
    var characterSelection = hexNumber.split('');
    var output = '';
    for (var i = 0; i < length; i++) {
        output += (0, exports.randomItem)(characterSelection);
    }
    return output;
};
exports.randomHex = randomHex;
