"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var login_1 = require("support/constants/login");
var general_1 = require("support/intercepts/general");
describe('account login redirect', function () {
    /**
     * The API will return 401 with the body below for all the endpoints.
     *
     * { "errors": [ { "reason": "Your account must be authorized to use this endpoint" } ] }
     */
    it('should redirect to the login page when the user is not authorized', function () {
        var errorReason = 'Your account must be authorized to use this endpoint';
        (0, general_1.mockApiRequestWithError)(401, errorReason);
        cy.visitWithLogin('/linodes/create');
        cy.url().should('contain', "".concat(login_1.loginBaseUrl, "/login?"), { exact: false });
    });
    /**
     * This test validates that the encoded redirect param is valid and can be properly decoded when the user is redirected to our application.
     */
    it('should redirect the user to the page they were on if the redirect param is present and valid', function () {
        cy.visitWithLogin('/linodes/create?type=Images');
        cy.url().should('contain', '/linodes/create');
        cy.clearLocalStorage('authentication/token');
        cy.reload();
        cy.url().should('contain', 'returnTo%253D%252Flinodes%252Fcreate%253Ftype%253DImages');
        cy.url().then(function (url) {
            // We need to decode the URL twice to get the original redirect URL.
            // The first decoding is done by the browser, the second by Cypress.
            var decodedOnce = decodeURIComponent(url);
            var decodedTwice = decodeURIComponent(decodedOnce);
            expect(decodedTwice).to.contain('/linodes/create?type=Images');
        });
    });
});
