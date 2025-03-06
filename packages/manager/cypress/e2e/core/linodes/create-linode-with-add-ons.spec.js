"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var linodes_1 = require("support/intercepts/linodes");
var ui_1 = require("support/ui");
var pages_1 = require("support/ui/pages");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
describe('Create Linode with Add-ons', function () {
    /*
     * - Confirms UI flow to create a Linode with backups using mock API data.
     * - Confirms that backups is reflected in create summary section.
     * - Confirms that outgoing Linode Create API request specifies the backups to be enabled.
     */
    it('can select Backups during Linode Create flow', function () {
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['Linodes'] });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        pages_1.linodeCreatePage.checkBackups();
        pages_1.linodeCreatePage.checkEUAgreements();
        // Confirm Backups assignment indicator is shown in Linode summary.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('Backups').should('be.visible');
        });
        // Create Linode and confirm contents of outgoing API request payload.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm property "backups_enabled" is "true" in the request payload.
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var backupsEnabled = requestPayload['backups_enabled'];
            expect(backupsEnabled).to.equal(true);
        });
        // Confirm redirect to new Linode.
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
    });
    /*
     * - Confirms UI flow to create a Linode with private IPs using mock API data.
     * - Confirms that Private IP is reflected in create summary section.
     * - Confirms that outgoing Linode Create API request specifies the private IPs to be enabled.
     */
    it('can select private IP during Linode Create flow', function () {
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['Linodes'] });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        pages_1.linodeCreatePage.checkEUAgreements();
        pages_1.linodeCreatePage.checkPrivateIPs();
        // Confirm Private IP assignment indicator is shown in Linode summary.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('Private IP').should('be.visible');
        });
        // Create Linode and confirm contents of outgoing API request payload.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm property "private_ip" is "true" in the request payload.
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var privateId = requestPayload['private_ip'];
            expect(privateId).to.equal(true);
        });
        // Confirm redirect to new Linode.
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
    });
});
