"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vitePreprocess = void 0;
var cypress_vite_1 = require("cypress-vite");
var path_1 = require("path");
var url_1 = require("url");
var vitePreprocess = function (on, _config) {
    on('file:preprocessor', (0, cypress_vite_1.default)((0, path_1.resolve)((0, url_1.fileURLToPath)(import.meta.url), '..', '..', '..', 'vite.config.ts')));
};
exports.vitePreprocess = vitePreprocess;
