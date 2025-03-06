"use strict";
/**
 * @file Linode Create view code snippets tests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var pages_1 = require("support/ui/pages");
var feature_flags_1 = require("support/intercepts/feature-flags");
describe('Create Linode flow to validate code snippet modal', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeInterfaces: { enabled: false },
        });
    });
    /*
     * tests for create Linode flow to validate code snippet modal.
     */
    it("view code snippets in create linode flow", function () {
        var linodeLabel = (0, random_1.randomLabel)();
        var rootPass = (0, random_1.randomString)(32);
        cy.visitWithLogin('/linodes/create');
        // Set Linode label, distribution, plan type, password, etc.
        pages_1.linodeCreatePage.setLabel(linodeLabel);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById('us-east');
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword(rootPass);
        // View Code Snippets and confirm it's provisioned as expected.
        ui_1.ui.button
            .findByTitle('View Code Snippets')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.dialog
            .findByTitle('Create Linode')
            .should('be.visible')
            .within(function () {
            ui_1.ui.tabList
                .findTabByTitle('cURL')
                .should('be.visible')
                .should('be.enabled');
            ui_1.ui.tabList.findTabByTitle('Linode CLI').should('be.visible').click();
            // Validate Integrations
            ui_1.ui.tabList.findTabByTitle('Integrations').should('be.visible').click();
            // Validate Ansible and links
            ui_1.ui.autocomplete.find().click();
            ui_1.ui.autocompletePopper
                .findByTitle('Ansible')
                .should('be.visible')
                .click();
            cy.contains('a', 'Getting Started With Ansible: Basic Installation and Setup').should('be.visible');
            cy.contains('a', 'Linode Cloud Instance Module').should('be.visible');
            cy.contains('a', 'Manage Personal Access Tokens').should('be.visible');
            cy.contains('a', 'Best Practices For Ansible').should('be.visible');
            cy.contains('a', 'Use the Linode Ansible Collection to Deploy a Linode').should('be.visible');
            // Validate Terraform and links
            ui_1.ui.autocomplete.find().click();
            ui_1.ui.autocompletePopper
                .findByTitle('Terraform')
                .should('be.visible')
                .click();
            cy.contains('a', "A Beginner's Guide to Terraform").should('be.visible');
            cy.contains('a', 'Install Terraform').should('be.visible');
            cy.contains('a', 'Manage Personal Access Tokens').should('be.visible');
            cy.contains('a', 'Use Terraform With Linode Object Storage').should('be.visible');
            cy.contains('a', 'Use Terraform to Provision Infrastructure on Linode').should('be.visible');
            cy.contains('a', 'Import Existing Infrastructure to Terraform').should('be.visible');
            // Validate SDKs tab
            ui_1.ui.tabList.findTabByTitle("SDKs").should('be.visible').click();
            ui_1.ui.autocomplete.find().click();
            // Validate linodego and links
            ui_1.ui.autocompletePopper
                .findByTitle('Go (linodego)')
                .should('be.visible')
                .click();
            cy.contains('a', 'Go client for Linode REST v4 API').should('be.visible');
            cy.contains('a', 'Linodego Documentation').should('be.visible');
            ui_1.ui.autocomplete.find().click();
            // Validate Python API4 and links
            ui_1.ui.autocompletePopper
                .findByTitle('Python (linode_api4-python)')
                .should('be.visible')
                .click();
            cy.contains('a', 'Official python library for the Linode APIv4 in python').should('be.visible');
            cy.contains('a', 'linode_api4-python Documentation').should('be.visible');
            ui_1.ui.button
                .findByTitle('Close')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
    });
});
