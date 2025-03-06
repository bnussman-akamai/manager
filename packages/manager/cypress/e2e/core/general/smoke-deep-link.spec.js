"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("support/ui/constants");
beforeEach(function () {
    cy.tag('method:e2e');
});
describe('smoke - deep links', function () {
    beforeEach(function () {
        cy.visitWithLogin('/null');
    });
    it('Go to each route and validate deep links', function () {
        constants_1.pages.forEach(function (page) {
            var _a;
            cy.log("Go to ".concat(page.name));
            (_a = page.goWithUI) === null || _a === void 0 ? void 0 : _a.forEach(function (uiPath) {
                cy.log("by ".concat(uiPath.name));
                expect(uiPath.name).not.to.be.empty;
                uiPath.go();
                cy.url().should('be.eq', "".concat(Cypress.config('baseUrl')).concat(page.url));
            });
        });
    });
});
