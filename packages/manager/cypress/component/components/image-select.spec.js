"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable sonarjs/no-duplicate-string */
var factories_1 = require("@src/factories");
var luxon_1 = require("luxon");
var react_1 = require("react");
var images_1 = require("support/intercepts/images");
var components_1 = require("support/util/components");
var random_1 = require("support/util/random");
var ImageSelect_1 = require("src/components/ImageSelect/ImageSelect");
/**
 * @param eol - The end-of-life date for the image.
 * @param deprecated - Whether the image is deprecated.
 * @returns - A mock image object.
 */
var createMockImage = function (eol, deprecated) {
    return factories_1.imageFactory.build({
        deprecated: deprecated,
        eol: eol,
        id: "public/".concat((0, random_1.randomNumber)()),
        is_public: true,
        label: (0, random_1.randomLabel)(),
        status: 'available',
    });
};
/**
 * @param isPast - Whether the date should be in the past.
 * @param days - The number of days to add to the current date.
 *
 * @returns - An ISO 8601 string containing the date relative to now.
 */
var generateDate = function (isPast, days) {
    return isPast
        ? luxon_1.DateTime.now().minus({ days: days }).toISO()
        : luxon_1.DateTime.now().plus({ days: days }).toISO();
};
/**
 * @param imageName - The name of the image.
 * @param eol - The end-of-life date for the image.
 * @returns - The warning message for a deprecated image that has reached its end-of-life.
 */
var getPastDeprecatedWarningMessage = function (imageName, eol) {
    return "".concat(imageName, " reached its end-of-life on ").concat(eol, ". This OS distribution will no longer receive security updates or technical support. We recommend selecting a newer supported version to ensure continued security and stability for your linodes.");
};
/**
 * @param imageName - The name of the image.
 * @param eol - The end-of-life date for the image.
 * @returns - The warning message for a deprecated image that has not yet reached its end-of-life.
 */
var getFutureDeprecatedWarningMessage = function (imageName, eol) {
    return "".concat(imageName, " will reach its end-of-life on ").concat(eol, ". After this date, this OS distribution will no longer receive security updates or technical support. We recommend selecting a newer supported version to ensure continued security and stability for your linodes.");
};
/**
 * @returns - A test component that uses the ImageSelect component.
 */
var TestComponent = function () {
    var _a = (0, react_1.useState)(null), selectedValue = _a[0], setSelectedValue = _a[1];
    return (<ImageSelect_1.ImageSelect label="Linux Distribution" onChange={function (selected) { return setSelectedValue(selected); }} placeholder="Choose a Linux distribution" value={selectedValue ? selectedValue.id : null} variant="public"/>);
};
/**
 * The tests for the ImageSelect component.
 */
(0, components_1.componentTests)('ImageSelect', function (mount) {
    describe('ImageSelect Component', function () {
        it('should display warning for deprecated image has reached eol', function () {
            var pastDate = generateDate(true, 1);
            var mockPastDeprecatedImage = createMockImage(pastDate, true);
            (0, images_1.mockGetAllImages)([mockPastDeprecatedImage]);
            mount(<TestComponent />);
            cy.findByPlaceholderText('Choose a Linux distribution')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.contains(mockPastDeprecatedImage.label).should('be.visible').click();
            cy.get('[data-testid="os-distro-deprecated-image-notice"]')
                .should('be.visible')
                .should('contain', getPastDeprecatedWarningMessage(mockPastDeprecatedImage.label, luxon_1.DateTime.fromISO(pastDate).toFormat('MM/dd/yyyy')));
        });
        it('should display warning for deprecated image has future eol', function () {
            var futureDate = generateDate(false, 1);
            var mockFutureDeprecatedImage = createMockImage(futureDate, true);
            (0, images_1.mockGetAllImages)([mockFutureDeprecatedImage]);
            mount(<TestComponent />);
            cy.findByPlaceholderText('Choose a Linux distribution')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.contains(mockFutureDeprecatedImage.label).should('be.visible').click();
            cy.get('[data-testid="os-distro-deprecated-image-notice"]')
                .should('be.visible')
                .should('contain', getFutureDeprecatedWarningMessage(mockFutureDeprecatedImage.label, luxon_1.DateTime.fromISO(futureDate).toFormat('MM/dd/yyyy')));
        });
        it('should not display warning for normal images', function () {
            var mockImage = createMockImage(null, false);
            (0, images_1.mockGetAllImages)([mockImage]);
            mount(<TestComponent />);
            cy.findByPlaceholderText('Choose a Linux distribution')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.contains(mockImage.label).should('be.visible').click();
            cy.get('[data-testid="os-distro-deprecated-image-notice"]').should('not.exist');
        });
    });
});
