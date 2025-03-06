"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_plugin_svgr_1 = require("vite-plugin-svgr");
var config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    plugins: [(0, vite_plugin_svgr_1.default)({ exportAsDefault: true })],
    test: {
        environment: 'jsdom',
        setupFiles: './testSetup.ts',
    },
});
