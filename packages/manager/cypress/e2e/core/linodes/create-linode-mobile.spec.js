"use strict";
/**
 * @file Smoke tests for Linode Create flow across common mobile viewport sizes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var environment_1 = require("support/constants/environment");
var pages_1 = require("support/ui/pages");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var ui_1 = require("support/ui");
var linodes_1 = require("support/intercepts/linodes");
describe('Linode create mobile smoke', function () {
    environment_1.MOBILE_VIEWPORTS.forEach(function (viewport) {
        /*
         * - Confirms Linode create flow can be completed on common mobile screen sizes
         * - Creates a basic Nanode and confirms interactions succeed and outgoing request contains expected data.
         */
        it("can create Linode (".concat(viewport.label, ")"), function () {
            var mockLinodeRegion = (0, regions_1.chooseRegion)();
            var mockLinode = factories_1.linodeFactory.build({
                id: (0, random_1.randomNumber)(),
                label: (0, random_1.randomLabel)(),
                region: mockLinodeRegion.id,
            });
            (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
            cy.viewport(viewport.width, viewport.height);
            cy.visitWithLogin('/linodes/create');
            pages_1.linodeCreatePage.selectImage('Ubuntu 24.04 LTS');
            pages_1.linodeCreatePage.selectRegionById(mockLinodeRegion.id);
            pages_1.linodeCreatePage.selectPlanCard('Shared CPU', 'Nanode 1 GB');
            pages_1.linodeCreatePage.setLabel(mockLinode.label);
            pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
            cy.get('[data-qa-linode-create-summary]').scrollIntoView();
            cy.get('[data-qa-linode-create-summary]').within(function () {
                cy.findByText('Nanode 1 GB').should('be.visible');
                cy.findByText('Ubuntu 24.04 LTS').should('be.visible');
                cy.findByText(mockLinodeRegion.label).should('be.visible');
            });
            ui_1.ui.button
                .findByTitle('Create Linode')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@createLinode').then(function (xhr) {
                var requestBody = xhr.request.body;
                expect(requestBody['image']).to.equal('linode/ubuntu24.04');
                expect(requestBody['label']).to.equal(mockLinode.label);
                expect(requestBody['region']).to.equal(mockLinodeRegion.id);
                expect(requestBody['type']).to.equal('g6-nanode-1');
            });
            cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        });
    });
});
