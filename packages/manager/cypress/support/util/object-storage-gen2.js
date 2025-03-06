"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimitsTable = void 0;
var checkRateLimitsTable = function (endpointType) {
    var expectedHeaders = ['Limits', 'GET', 'PUT', 'LIST', 'DELETE', 'OTHER'];
    var expectedBasicValues = ['Basic', '2,000', '500', '100', '200', '400'];
    var expectedHighValues = endpointType === 'E3'
        ? ['High', '20,000', '2,000', '400', '400', '1,000']
        : ['High', '5,000', '1,000', '200', '200', '800'];
    cy.get('[data-testid="bucket-rate-limit-table"]').within(function () {
        expectedHeaders.forEach(function (header, index) {
            cy.get('th').eq(index).should('contain.text', header);
        });
        cy.contains('tr', 'Basic').within(function () {
            expectedBasicValues.forEach(function (value, index) {
                cy.get('td').eq(index).should('contain.text', value);
            });
        });
        cy.contains('tr', 'High').within(function () {
            expectedHighValues.forEach(function (value, index) {
                cy.get('td').eq(index).should('contain.text', value);
            });
        });
        // Check that Basic radio button is checked
        cy.findByLabelText('Basic').should('be.checked');
    });
};
exports.checkRateLimitsTable = checkRateLimitsTable;
