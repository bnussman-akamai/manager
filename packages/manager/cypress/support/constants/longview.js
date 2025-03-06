"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.longviewAddClientButtonText = exports.longviewEmptyStateMessage = exports.longviewStatusTimeout = exports.longviewInstallTimeout = void 0;
/**
 * Timeout when installing Longview client on a Linode.
 *
 * Equates to 4 minutes and 15 seconds.
 */
exports.longviewInstallTimeout = 255000;
/**
 * Timeout when waiting for a Longview client's status to be updated.
 *
 * Equates to 1 minute.
 */
exports.longviewStatusTimeout = 60000;
/**
 * Message that will be displayed when no clients are present.
 */
exports.longviewEmptyStateMessage = 'You have no Longview clients configured.';
/**
 * Button text to add a new Longview client.
 */
exports.longviewAddClientButtonText = 'Click here to add one.';
