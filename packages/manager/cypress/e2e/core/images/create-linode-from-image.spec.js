"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var intercepts_1 = require("support/util/intercepts");
var random_1 = require("support/util/random");
var images_1 = require("support/intercepts/images");
var factories_1 = require("@src/factories");
var regions_1 = require("support/util/regions");
var ui_1 = require("support/ui");
var region = (0, regions_1.chooseRegion)();
var mockLinode = factories_1.linodeFactory.build({
    region: region.id,
    id: 123456,
});
var mockImage = factories_1.imageFactory.build({
    label: (0, random_1.randomLabel)(),
    is_public: false,
    eol: null,
    id: "private/".concat((0, random_1.randomNumber)()),
});
var createLinodeWithImageMock = function (url, preselectedImage) {
    (0, images_1.mockGetAllImages)([mockImage]).as('mockImage');
    cy.intercept('POST', (0, intercepts_1.apiMatcher)('linode/instances'), function (req) {
        req.reply({
            body: mockLinode,
            headers: { image: mockImage.id },
        });
    }).as('mockLinodeRequest');
    cy.visitWithLogin(url);
    cy.wait('@mockImage');
    if (!preselectedImage) {
        cy.findByPlaceholderText('Choose an image')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.findByText(mockImage.label)
            .should('be.visible')
            .should('be.enabled')
            .click();
    }
    ui_1.ui.regionSelect.find().click();
    ui_1.ui.regionSelect.findItemByRegionId(region.id).click();
    cy.findByText('Shared CPU').click();
    cy.get('[id="g6-nanode-1"][type="radio"]').click();
    cy.get('[id="root-password"]').type((0, random_1.randomString)(32));
    ui_1.ui.button
        .findByTitle('Create Linode')
        .scrollIntoView()
        .should('be.visible')
        .should('be.enabled')
        .click();
    cy.wait('@mockLinodeRequest');
    cy.findByText(mockLinode.label).should('be.visible');
    cy.findByText(region.label).should('be.visible');
    cy.findByText("".concat(mockLinode.id)).should('be.visible');
};
describe('create linode from image, mocked data', function () {
    /*
     * - Confirms UI flow when user attempts to create a Linode from images without having any images.
     */
    it('cannot create a Linode when the user has no private images', function () {
        // Substrings of the message shown to ensure user is informed of why they
        // cannot create a Linode and guided towards creating an Image.
        var noImagesMessages = [
            'You don’t have any private Images.',
            'create an Image from one of your Linode’s disks.',
        ];
        (0, images_1.mockGetAllImages)([]).as('getImages');
        cy.visitWithLogin('/linodes/create?type=Images');
        cy.wait('@getImages');
        noImagesMessages.forEach(function (message) {
            cy.findByText(message, { exact: false }).should('be.visible');
        });
    });
    it('creates linode from image on images tab', function () {
        createLinodeWithImageMock('/linodes/create?type=Images', false);
    });
    it('creates linode from preselected image on images tab', function () {
        createLinodeWithImageMock("/linodes/create/?type=Images&imageID=".concat(mockImage.id), true);
    });
});
