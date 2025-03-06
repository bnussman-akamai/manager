"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var login_1 = require("support/constants/login");
var account_1 = require("support/intercepts/account");
var ui_1 = require("support/ui");
describe('Logout Test', function () {
    beforeEach(function () {
        cy.tag('purpose:syntheticTesting', 'method:e2e');
    });
    /*
     * - Confirms that Cloud Manager log out functionality works as expected.
     * - Confirms that the login application is up after account logout.
     */
    it('can logout the account and redirect to login endpoint', function () {
        (0, account_1.interceptGetAccount)().as('getAccount');
        cy.visitWithLogin('/account');
        cy.wait('@getAccount');
        // User can click Logout via user menu.
        ui_1.ui.userMenuButton.find().click();
        ui_1.ui.userMenu
            .find()
            .should('be.visible')
            .within(function () {
            cy.findByText('Log Out').should('be.visible').click();
        });
        // Upon clicking "Log Out", the user is redirected to the login endpoint at <REACT_APP_LOGIN_ROOT>/login
        cy.url().should('equal', "".concat(login_1.loginBaseUrl, "/login"));
        // Using cy.visit to navigate back to Cloud results in another redirect to the login page
        cy.visit('/');
        cy.url().should('startWith', "".concat(login_1.loginBaseUrl, "/login"));
    });
});
