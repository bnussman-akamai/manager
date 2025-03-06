"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var lke_1 = require("support/intercepts/lke");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
/*
 * Fills out and submits Type to Confirm deletion dialog for cluster with the given label.
 */
var completeTypeToConfirmDialog = function (clusterLabel) {
    var deletionWarning = "Deleting a cluster is permanent and can't be undone.";
    ui_1.ui.dialog
        .findByTitle("Delete Cluster ".concat(clusterLabel))
        .should('be.visible')
        .within(function () {
        cy.findByText(deletionWarning, { exact: false }).should('be.visible');
        cy.findByLabelText('Cluster Name').should('be.visible').click();
        cy.focused().type(clusterLabel);
        ui_1.ui.buttonGroup
            .findButtonByTitle('Delete Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
};
describe('LKE cluster deletion', function () {
    /*
     * - Confirms LKE cluster deletion flow via landing page.
     * - Confirms that landing page updates to reflect deleted cluster.
     */
    it('can delete an LKE cluster from summary page', function () {
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            label: (0, random_1.randomLabel)(),
        });
        (0, lke_1.mockGetClusters)([mockCluster]).as('getClusters');
        (0, lke_1.mockDeleteCluster)(mockCluster.id).as('deleteCluster');
        cy.visitWithLogin('/kubernetes/clusters');
        cy.wait('@getClusters');
        // Find mock cluster in table, click its "Delete" button.
        cy.findByText(mockCluster.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.enabled')
                .should('be.visible')
                .click();
        });
        // Fill out and submit type-to-confirm.
        (0, lke_1.mockGetClusters)([]).as('getClusters');
        completeTypeToConfirmDialog(mockCluster.label);
        // Confirm that cluster is no longer listed on landing page.
        cy.wait(['@deleteCluster', '@getClusters']);
        cy.findByText(mockCluster.label).should('not.exist');
        // Confirm that Kubernetes welcome page is shown when there are no clusters.
        cy.findByText('Fully managed Kubernetes infrastructure').should('be.visible');
        ui_1.ui.button
            .findByTitle('Create Cluster')
            .should('be.visible')
            .should('be.enabled');
    });
    /*
     * - Confirms LKE cluster deletion flow via details page.
     * - Confirms that user is redirected to landing page upon cluster deletion.
     */
    it('can delete an LKE cluster from landing page', function () {
        var mockCluster = factories_1.kubernetesClusterFactory.build({
            label: (0, random_1.randomLabel)(),
        });
        // Navigate to details page for mocked LKE cluster.
        (0, lke_1.mockGetCluster)(mockCluster).as('getCluster');
        (0, lke_1.mockDeleteCluster)(mockCluster.id).as('deleteCluster');
        cy.visitWithLogin("/kubernetes/clusters/".concat(mockCluster.id, "/summary"));
        cy.wait('@getCluster');
        // Press "Delete Cluster" button, complete type-to-confirm, and confirm redirect.
        ui_1.ui.button
            .findByTitle('Delete Cluster')
            .should('be.visible')
            .should('be.enabled')
            .click();
        completeTypeToConfirmDialog(mockCluster.label);
        cy.wait('@deleteCluster');
        cy.url().should('endWith', 'kubernetes/clusters');
    });
});
