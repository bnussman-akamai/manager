"use strict";
/**
 * @file Page utilities for Linode Create page (v2 implementation).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.linodeCreatePage = void 0;
var ui_1 = require("support/ui");
/**
 * Page utilities for interacting with the Linode create page.
 */
exports.linodeCreatePage = {
    /**
     * Checks the Linode's backups.
     */
    checkBackups: function () {
        // eslint-disable-next-line sonarjs/no-duplicate-string
        cy.get('[data-testid="backups"]').should('be.visible').click();
    },
    /**
     * Checks the EU agreements.
     */
    checkEUAgreements: function () {
        cy.get('body').then(function ($body) {
            if ($body.find('div[data-testid="eu-agreement-checkbox"]').length > 0) {
                // eslint-disable-next-line cypress/unsafe-to-chain-command
                cy.findAllByText('EU Standard Contractual Clauses', {
                    exact: false,
                }).should('be.visible');
                // eslint-disable-next-line cypress/unsafe-to-chain-command
                cy.get('[data-testid="eu-agreement-checkbox"]')
                    .within(function () {
                    // eslint-disable-next-line cypress/unsafe-to-chain-command
                    cy.get('[id="gdpr-checkbox"]').click();
                })
                    .click();
            }
        });
    },
    /**
     * Checks the Linode's private IPs.
     */
    checkPrivateIPs: function () {
        cy.findByText('Private IP').should('be.visible').closest('label').click();
    },
    /**
     * Selects the Image with the given name.
     *
     * @param imageName - Name of Image to select.
     */
    selectImage: function (imageName) {
        cy.findByText('Choose an OS')
            .closest('[data-qa-paper]')
            .within(function () {
            ui_1.ui.autocomplete.find().click();
            ui_1.ui.autocompletePopper
                .findByTitle(imageName)
                .should('be.visible')
                .click();
        });
    },
    /**
     * Select the given Linode plan.
     *
     * Assumes that plans are displayed in a table.
     *
     * @param planTabTitle - Title of tab where desired plan is located.
     * @param planTitle - Title of desired plan.
     */
    selectPlan: function (planTabTitle, planTitle) {
        cy.get('[data-qa-tp="Linode Plan"]').within(function () {
            ui_1.ui.tabList.findTabByTitle(planTabTitle).click();
            cy.get("[data-qa-plan-row=\"".concat(planTitle, "\"]"))
                .closest('tr')
                .should('be.visible')
                .click();
        });
    },
    /**
     * Select the given Linode plan selection card.
     *
     * Useful for testing Linode create page against mobile viewports.
     *
     * Assumes that plans are displayed as selection cards.
     */
    selectPlanCard: function (planTabTitle, planTitle) {
        cy.get('[data-qa-tp="Linode Plan"]').within(function () {
            ui_1.ui.tabList.findTabByTitle(planTabTitle).click();
            cy.findByText(planTitle)
                .should('be.visible')
                .as('selectionCard')
                .scrollIntoView();
            cy.get('@selectionCard').click();
        });
    },
    /**
     * Select the Region with the given ID.
     *
     * @param regionId - ID of Region to select.
     */
    selectRegionById: function (regionId) {
        ui_1.ui.regionSelect.find().click().type("".concat(regionId, "{enter}"));
    },
    /**
     * Sets the Linode's label.
     *
     * @param linodeLabel - Linode label to set.
     */
    setLabel: function (linodeLabel) {
        cy.findByLabelText('Linode Label').type("{selectall}{del}".concat(linodeLabel));
    },
    /**
     * Sets the Linode's root password.
     *
     * @param linodePassword - Root password to set.
     */
    setRootPassword: function (linodePassword) {
        cy.findByLabelText('Root Password').as('rootPasswordField').click();
        cy.get('@rootPasswordField').type(linodePassword, { log: false });
    },
};
