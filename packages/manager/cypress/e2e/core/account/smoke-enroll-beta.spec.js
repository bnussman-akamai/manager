"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var luxon_1 = require("luxon");
var authentication_1 = require("support/api/authentication");
var betas_1 = require("support/intercepts/betas");
var feature_flags_1 = require("support/intercepts/feature-flags");
(0, authentication_1.authenticate)();
beforeEach(function () {
    cy.tag('method:e2e');
});
describe('Enroll in a Beta Program', function () {
    it('checks the Beta Programs page', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            selfServeBetas: true,
        }).as('getFeatureFlags');
        var currentlyEnrolledBeta = factories_1.accountBetaFactory.build({
            enrolled: luxon_1.DateTime.now().minus({ days: 10 }).toISO(),
            id: '12345',
            started: luxon_1.DateTime.now().minus({ days: 11 }).toISO(),
        });
        var availableBetas = factories_1.betaFactory.buildList(2);
        var historicalBetas = factories_1.accountBetaFactory.buildList(2, {
            ended: luxon_1.DateTime.now().minus({ days: 5 }).toISO(),
            enrolled: luxon_1.DateTime.now().minus({ days: 10 }).toISO(),
            id: '1234',
            label: 'Historical Beta',
            started: luxon_1.DateTime.now().minus({ days: 15 }).toISO(),
        });
        var accountBetas = __spreadArray([currentlyEnrolledBeta], historicalBetas, true);
        (0, betas_1.mockGetAccountBetas)(accountBetas).as('getAccountBetas');
        (0, betas_1.mockGetBetas)(availableBetas).as('getBetas');
        (0, betas_1.mockGetBeta)(availableBetas[0]).as('getBeta');
        (0, betas_1.mockPostBeta)(availableBetas[0]).as('postBeta');
        cy.visitWithLogin('/betas');
        cy.wait('@getBetas');
        cy.wait('@getAccountBetas');
        cy.get('[data-qa-beta-details="enrolled-beta"]').should('have.length', 1);
        cy.get('[data-qa-beta-details="available-beta"]').should('have.length', 2);
        cy.get('[data-qa-beta-details="historical-beta"]').should('have.length', 1);
        cy.get('[data-qa-beta-details="available-beta"]')
            .first()
            .within(function () {
            cy.get('button').click();
        });
        cy.wait('@getBeta');
        cy.url().should('include', '/betas/signup/beta-1');
        cy.findByRole('button', { name: 'Sign Up' }).should('be.disabled');
        cy.findByText('I agree to the terms').click();
        cy.findByRole('button', { name: 'Sign Up' }).should('be.enabled').click();
        cy.wait('@postBeta');
        cy.url().should('include', '/betas');
        cy.url().should('not.include', 'signup');
    });
});
