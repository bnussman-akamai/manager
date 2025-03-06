"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var images_1 = require("support/intercepts/images");
var linodes_1 = require("support/intercepts/linodes");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var pages_1 = require("support/ui/pages");
var random_1 = require("support/util/random");
var regions_2 = require("support/util/regions");
describe('Create Linode with user data', function () {
    /*
     * - Confirms UI flow to create a Linode with cloud-init user data specified.
     * - Confirms that outgoing API request contains expected user data payload.
     */
    it('can specify user data during Linode Create flow', function () {
        var linodeRegion = (0, regions_2.chooseRegion)({
            capabilities: ['Linodes', 'Metadata'],
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var userDataFixturePath = 'user-data/user-data-config-basic.yml';
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin('/linodes/create');
        // Fill out create form, selecting a region and image that both have
        // cloud-init capabilities.
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Expand "Add User Data" accordion and enter user data config.
        ui_1.ui.accordionHeading
            .findByTitle('Add User Data')
            .should('be.visible')
            .click();
        cy.fixture(userDataFixturePath).then(function (userDataContents) {
            ui_1.ui.accordion.findByTitle('Add User Data').within(function () {
                cy.findByText('User Data').click();
                cy.focused().type(userDataContents);
            });
            // Submit form to create Linode and confirm that outgoing API request
            // contains expected user data.
            ui_1.ui.button
                .findByTitle('Create Linode')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@createLinode').then(function (xhr) {
                var requestPayload = xhr.request.body;
                expect(requestPayload['metadata']['user_data']).to.equal(btoa(userDataContents));
            });
        });
    });
    /*
     * - Confirms UI flow when creating a Linode using a region that lacks cloud-init capability.
     * - Confirms that "Add User Data" section is hidden when selected region lacks cloud-init.
     */
    it('cannot specify user data when selected region does not support it', function () {
        var mockLinodeRegion = factories_1.regionFactory.build({
            capabilities: ['Linodes'],
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockLinodeRegion.id,
        });
        (0, regions_1.mockGetRegions)([mockLinodeRegion]);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(mockLinodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        // Confirm that "Add User Data" section is hidden when selected region
        // lacks cloud-init capability.
        cy.findByText('Add User Data').should('not.exist');
    });
    /*
     * - Confirms UI flow when creating a Linode using an image that lacks cloud-init capability.
     * - Confirms that "Add User Data" section is hidden when selected image lacks cloud-init.
     */
    it('cannot specify user data when selected image does not support it', function () {
        var linodeRegion = (0, regions_2.chooseRegion)({
            capabilities: ['Linodes', 'Metadata'],
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var mockImage = factories_1.imageFactory.build({
            id: "linode/".concat((0, random_1.randomLabel)()),
            label: (0, random_1.randomLabel)(),
            created_by: 'linode',
            is_public: true,
            vendor: 'Debian',
            // `cloud-init` is omitted from Image capabilities.
            capabilities: [],
            // null eol so that the image is not deprecated
            eol: null,
        });
        (0, images_1.mockGetImage)(mockImage.id, mockImage);
        (0, images_1.mockGetAllImages)([mockImage]);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage(mockImage.label);
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        // Confirm that "Add User Data" section is hidden when selected image
        // lacks cloud-init capability.
        cy.findByText('Add User Data').should('not.exist');
    });
});
