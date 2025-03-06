"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// We can't import Cypress types cleanly because of our tsconfig's `moduleResolution` setting.
// For now, we will re-rexport types here so they are easily usable in our test suite.
//
// Cypress issue: https://github.com/cypress-io/cypress/issues/27973
// Extra Context: https://github.com/linode/manager/pull/11611#discussion_r1941711748
__exportStar(require("../../node_modules/cypress/types/net-stubbing"), exports);
