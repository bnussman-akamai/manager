"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDownload = exports.getDownloadFilepath = void 0;
// Path to Cypress downloads folder.
var downloadsPath = Cypress.config('downloadsFolder');
/**
 * Returns the path to the downloaded file with the given filename.
 *
 * @param filename - Filename of downloaded file for which to get path.
 *
 * @returns Path to download with the given filename.
 */
var getDownloadFilepath = function (filename) {
    return "".concat(downloadsPath, "/").concat(filename);
};
exports.getDownloadFilepath = getDownloadFilepath;
/**
 * Reads a downloaded file with the given filename.
 *
 * @param filename - Filename of downloaded file to read.
 *
 * @returns Cypress chainable.
 */
var readDownload = function (filename) {
    return cy.readFile((0, exports.getDownloadFilepath)(filename));
};
exports.readDownload = readDownload;
