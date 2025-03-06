"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var linodes_1 = require("support/util/linodes");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var linodes_2 = require("support/constants/linodes");
var authentication_1 = require("support/api/authentication");
var random_1 = require("support/util/random");
(0, authentication_1.authenticate)();
describe('update linode label', function () {
    beforeEach(function () {
        (0, cleanup_1.cleanUp)(['linodes']);
        cy.tag('method:e2e');
    });
    it('updates a linode label from details page', function () {
        cy.defer(function () { return (0, linodes_1.createTestLinode)({ booted: true }); }).then(function (linode) {
            var newLinodeLabel = (0, random_1.randomLabel)();
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.contains('RUNNING', { timeout: linodes_2.LINODE_CREATE_TIMEOUT }).should('be.visible');
            cy.get("[aria-label=\"Edit ".concat(linode.label, "\"]")).click();
            cy.get("[id=\"edit-".concat(linode.label, "-label\"]")).click();
            cy.focused().clear();
            cy.focused().type("".concat(newLinodeLabel, "{enter}"));
            cy.visitWithLogin('/linodes');
            cy.get("[data-qa-linode=\"".concat(newLinodeLabel, "\"]")).should('be.visible');
        });
    });
    it('updates a linode label from the "Settings" tab', function () {
        cy.defer(function () { return (0, linodes_1.createTestLinode)({ booted: true }); }).then(function (linode) {
            var newLinodeLabel = (0, random_1.randomLabel)();
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.contains('RUNNING', { timeout: linodes_2.LINODE_CREATE_TIMEOUT }).should('be.visible');
            cy.visitWithLogin("/linodes/".concat(linode.id, "/settings"));
            cy.get('[id="label"]').click();
            cy.focused().clear();
            cy.focused().type("".concat(newLinodeLabel, "{enter}"));
            ui_1.ui.buttonGroup.findButtonByTitle('Save').should('be.visible').click();
            cy.visitWithLogin('/linodes');
            cy.get("[data-qa-linode=\"".concat(newLinodeLabel, "\"]")).should('be.visible');
        });
    });
});
