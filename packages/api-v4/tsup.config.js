"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tsup_1 = require("tsup");
exports.default = (0, tsup_1.defineConfig)({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs', 'iife'],
    target: 'es6',
    outDir: 'lib',
    splitting: false,
    dts: false,
});
