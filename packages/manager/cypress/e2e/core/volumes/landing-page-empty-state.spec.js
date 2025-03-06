"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var volumes_1 = require("support/intercepts/volumes");
describe('confirms Volumes landing page empty state is shown when no Volumes exist', function () {
    /*
     * - Confirms that Getting Started Guides is listed on landing page.
     * - Confirms that Video Playlist is listed on landing page.
     * - Confirms that clicking on Create Volume button navigates user to volume create page.
     */
    it('shows the empty state when no Volumes exist', function () {
        (0, volumes_1.mockGetVolumes)([]).as('getVolumes');
        cy.visitWithLogin('/volumes');
        cy.wait(['@getVolumes']);
        cy.findByText('NVMe block storage service').should('be.visible');
        cy.findByText('Getting Started Guides').should('be.visible');
        cy.findByText('Video Playlist').should('be.visible');
        // Create Volume button exists and clicking it navigates user to create volume page.
        ui_1.ui.button
            .findByTitle('Create Volume')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', '/volumes/create');
    });
});
