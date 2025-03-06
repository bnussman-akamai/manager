"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var intercepts_1 = require("support/util/intercepts");
beforeEach(function () {
    cy.tag('method:e2e');
});
describe('account activation', function () {
    /**
     * The API will return 403 with the body below for most endpoint except `/v4/profile`.
     *
     * { "errors": [ { "reason": "Your account must be activated before you can use this endpoint" } ] }
     */
    it('should render an activation landing page if the customer is not activated', function () {
        cy.intercept('GET', (0, intercepts_1.apiMatcher)('*'), {
            body: {
                errors: [
                    {
                        reason: 'Your account must be activated before you can use this endpoint',
                    },
                ],
            },
            statusCode: 403,
        });
        cy.visitWithLogin('/');
        cy.findByText('Your account is currently being reviewed.');
        cy.findByText('open a support ticket', { exact: false });
    });
});
