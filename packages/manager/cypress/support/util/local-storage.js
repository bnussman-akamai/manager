"use strict";
/**
 * @file Utilities to access and validate Local Storage data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertLocalStorageValue = void 0;
/**
 * Asserts that a local storage item has a given value.
 *
 * @param key - Local storage item key.
 * @param value - Local storage item value to assert.
 */
var assertLocalStorageValue = function (key, value) {
    cy.getAllLocalStorage().then(function (localStorageData) {
        var origin = Cypress.config('baseUrl');
        if (!origin) {
            // This should never happen in practice.
            throw new Error('Unable to retrieve Cypress base URL configuration');
        }
        if (!localStorageData[origin]) {
            throw new Error("Unable to retrieve local storage data from origin '".concat(origin, "'"));
        }
        if (!localStorageData[origin][key]) {
            throw new Error("No local storage data exists for key '".concat(key, "' and origin '").concat(origin, "'"));
        }
        expect(localStorageData[origin][key]).equals(value);
    });
};
exports.assertLocalStorageValue = assertLocalStorageValue;
