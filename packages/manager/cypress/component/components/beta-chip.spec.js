"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var accessibility_1 = require("support/util/accessibility");
var components_1 = require("support/util/components");
var BetaChip_1 = require("src/components/BetaChip/BetaChip");
(0, components_1.componentTests)('BetaChip', function () {
    (0, components_1.visualTests)(function (mount) {
        it('renders "BETA" text indicator with primary color', function () {
            mount(<BetaChip_1.BetaChip color="primary"/>);
            cy.findByText('beta').should('be.visible');
        });
        it('renders "BETA" text indicator with default color', function () {
            mount(<BetaChip_1.BetaChip color="default"/>);
            cy.findByText('beta').should('be.visible');
        });
        it('passes aXe check with primary color', function () {
            mount(<BetaChip_1.BetaChip color="primary"/>);
            (0, accessibility_1.checkComponentA11y)();
        });
        it('passes aXe check with default color', function () {
            mount(<BetaChip_1.BetaChip color="default"/>);
            (0, accessibility_1.checkComponentA11y)();
        });
    });
});
