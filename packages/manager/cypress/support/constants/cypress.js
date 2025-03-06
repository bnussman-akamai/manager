"use strict";
/**
 * @file Constants related to the operation of Cypress end-to-end tests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityPrefix = exports.entityTag = void 0;
/**
 * Tag to identify test entities, resources, etc.
 */
exports.entityTag = 'cy-test';
/**
 * Prefix for entity names and labels that will be created by Cypress tests.
 *
 * The prefix contains the entity tag followed by a hyphen.
 *
 * This can be used to identify resources created by Cypress, e.g. for
 * clean-up purposes.
 */
exports.entityPrefix = "".concat(exports.entityTag, "-");
