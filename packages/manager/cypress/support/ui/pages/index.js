"use strict";
/**
 * @file Index file for Cypress page utility re-exports.
 *
 * Page utilities are basic JavaScript objects containing functions to perform
 * common page-specific interactions. They allow us to minimize code duplication
 * across tests that interact with similar pages.
 *
 * Page utilities are NOT page objects in the traditional UI testing sense.
 * Specifically, page utility objects should NOT have state, and page utilities
 * should only be concerned with interacting with or asserting the state of
 * the DOM.
 */
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
__exportStar(require("./linode-create-page"), exports);
__exportStar(require("./vpc-create-drawer"), exports);
