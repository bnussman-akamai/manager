"use strict";
/**
 * Constants related to Cloud Manager login/logout flows.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginBaseUrl = void 0;
/**
 * Login base URL for Cloud Manager.
 */
exports.loginBaseUrl = Cypress.env('REACT_APP_LOGIN_ROOT');
