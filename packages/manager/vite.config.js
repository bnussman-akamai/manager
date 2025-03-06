"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_react_swc_1 = require("@vitejs/plugin-react-swc");
var url_1 = require("url");
var vite_plugin_svgr_1 = require("vite-plugin-svgr");
var config_1 = require("vitest/config");
// ESM-friendly alternative to `__dirname`.
var DIRNAME = new url_1.URL('.', import.meta.url).pathname;
exports.default = (0, config_1.defineConfig)({
    build: {
        outDir: 'build',
    },
    envPrefix: 'REACT_APP_',
    plugins: [(0, plugin_react_swc_1.default)(), (0, vite_plugin_svgr_1.default)({ exportAsDefault: true })],
    resolve: {
        alias: {
            src: "".concat(DIRNAME, "/src"),
        },
    },
    server: {
        allowedHosts: ['cloud.lindev.local'],
        port: 3000,
    },
    test: {
        coverage: {
            exclude: [
                'src/**/*.constants.{js,jsx,ts,tsx}',
                'src/**/*.stories.{js,jsx,ts,tsx}',
                'src/**/index.{js,jsx,ts,tsx}',
                'src/**/*.styles.{js,jsx,ts,tsx}',
            ],
            include: [
                'src/components/**/*.{js,jsx,ts,tsx}',
                'src/hooks/*{js,jsx,ts,tsx}',
                'src/utilities/**/*.{js,jsx,ts,tsx}',
                'src/**/*.utils.{js,jsx,ts,tsx}',
            ],
        },
        environment: 'jsdom',
        globals: true,
        pool: 'forks',
        setupFiles: './src/testSetup.ts',
    },
});
