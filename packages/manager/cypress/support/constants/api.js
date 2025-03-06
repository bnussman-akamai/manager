"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageSize = exports.oauthToken = void 0;
/**
 * API OAuth token for authenticating API requests and Cloud Manager interactions.
 */
exports.oauthToken = Cypress.env('MANAGER_OAUTH');
/**
 * API request pagination page size.
 */
exports.pageSize = 500;
