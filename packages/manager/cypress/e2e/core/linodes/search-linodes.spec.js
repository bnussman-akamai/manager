"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var authentication_1 = require("support/api/authentication");
var linodes_1 = require("support/util/linodes");
(0, authentication_1.authenticate)();
describe('Search Linodes', function () {
    beforeEach(function () {
        (0, cleanup_1.cleanUp)(['linodes']);
        cy.tag('method:e2e');
    });
    /*
     * - Confirm that linodes are searchable and filtered in the UI.
     */
    it('create a linode and make sure it shows up in the table and is searchable in main search tool', function () {
        cy.defer(function () {
            return (0, linodes_1.createTestLinode)({ booted: true }, { waitForBoot: true });
        }).then(function (linode) {
            cy.visitWithLogin('/linodes');
            cy.get("[data-qa-linode=\"".concat(linode.label, "\"]"))
                .should('be.visible')
                .within(function () {
                cy.contains('Running').should('be.visible');
            });
            // Confirm that linode is listed on the landing page.
            cy.findByText(linode.label).should('be.visible');
            // Use the main search bar to search and filter linode by label
            ui_1.ui.mainSearch.find().type(linode.label);
            ui_1.ui.autocompletePopper.findByTitle(linode.label).should('be.visible');
            // Use the main search bar to search and filter linode by id value
            ui_1.ui.mainSearch.find().clear().type("".concat(linode.id));
            ui_1.ui.autocompletePopper.findByTitle(linode.label).should('be.visible');
            // Use the main search bar to search and filter linode by id: pattern
            ui_1.ui.mainSearch.find().clear().type("id:".concat(linode.id));
            ui_1.ui.autocompletePopper.findByTitle(linode.label).should('be.visible');
        });
    });
});
