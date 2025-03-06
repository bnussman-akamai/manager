"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var random_1 = require("support/util/random");
var lke_1 = require("support/intercepts/lke");
var ui_1 = require("support/ui");
var regions_1 = require("support/util/regions");
/**
 * Performs a click operation on Cypress subject a given number of times.
 *
 * @param subject - Cypress subject to click.
 * @param count - Number of times to perform click.
 *
 * @returns Cypress chainable.
 */
var multipleClick = function (subject, count) {
    if (count == 1) {
        return subject.click();
    }
    return multipleClick(subject.click(), count - 1);
};
/**
 * Adds a random-sized node pool of the given plan.
 *
 * @param plan Name of plan for which to add nodes.
 */
var addNodes = function (plan) {
    var defaultNodes = 3;
    var extraNodes = (0, random_1.randomNumber)(1, 5);
    cy.get("[data-qa-plan-row=\"".concat(plan, "\"")).within(function () {
        multipleClick(cy.get('[data-testid="increment-button"]'), extraNodes);
        multipleClick(cy.get('[data-testid="decrement-button"]'), extraNodes + 1);
        cy.get('[data-testid="textfield-input"]')
            .invoke('val')
            .should('eq', "".concat(defaultNodes - 1));
        ui_1.ui.button
            .findByTitle('Add')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
};
// Warning that's shown when recommended minimum number of nodes is not met.
var minimumNodeNotice = 'We recommend a minimum of 3 nodes in each Node Pool to avoid downtime during upgrades and maintenance.';
describe('LKE Create Cluster', function () {
    it('Simple Page Check', function () {
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            label: (0, random_1.randomLabel)(),
            id: (0, random_1.randomNumber)(10000, 99999),
        });
        (0, lke_1.mockCreateCluster)(mockCluster).as('createCluster');
        cy.visitWithLogin('/kubernetes/create');
        cy.findByText('Add Node Pools').should('be.visible');
        cy.findByLabelText('Cluster Label').click();
        cy.focused().type(mockCluster.label);
        ui_1.ui.regionSelect.find().click().type("".concat((0, regions_1.chooseRegion)().label, "{enter}"));
        cy.findByText('Kubernetes Version').should('be.visible').click();
        cy.focused().type('{enter}');
        cy.get('[data-testid="ha-radio-button-yes"]').should('be.visible').click();
        cy.findByText('Shared CPU').should('be.visible').click();
        addNodes('Linode 2 GB');
        // Confirm change is reflected in checkout bar.
        cy.get('[data-testid="kube-checkout-bar"]').within(function () {
            cy.findByText('Linode 2 GB Plan').should('be.visible');
            cy.findByTitle('Remove Linode 2GB Node Pool').should('be.visible');
            cy.get('[data-qa-notice="true"]').within(function () {
                cy.findByText(minimumNodeNotice).should('be.visible');
            });
            ui_1.ui.button
                .findByTitle('Create Cluster')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@createCluster');
        cy.url().should('endWith', "/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
    });
});
