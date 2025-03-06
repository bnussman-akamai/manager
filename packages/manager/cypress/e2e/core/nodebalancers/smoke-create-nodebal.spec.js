"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cypress_1 = require("support/constants/cypress");
var linodes_1 = require("support/util/linodes");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var authentication_1 = require("support/api/authentication");
var deployNodeBalancer = function () {
    cy.get('[data-qa-deploy-nodebalancer]').click();
};
var factories_1 = require("src/factories");
var nodebalancers_1 = require("support/intercepts/nodebalancers");
var regions_2 = require("support/intercepts/regions");
var linodes_2 = require("support/intercepts/linodes");
var createNodeBalancerWithUI = function (nodeBal, isDcPricingTest) {
    if (isDcPricingTest === void 0) { isDcPricingTest = false; }
    var regionName = (0, regions_1.getRegionById)(nodeBal.region).label;
    cy.visitWithLogin('/nodebalancers/create');
    cy.get('[id="nodebalancer-label"]').should('be.visible').click();
    cy.focused().clear();
    cy.focused().type(nodeBal.label);
    cy.findByPlaceholderText(/create a tag/i).click();
    cy.focused().type(cypress_1.entityTag);
    if (isDcPricingTest) {
        var newRegion = (0, regions_1.getRegionById)('br-gru');
        // Confirms that the price will not display when the region is not selected
        cy.get('[data-qa-summary="true"]').within(function () {
            cy.findByText('/month').should('not.exist');
        });
        // Confirms that the price will show up when the region is selected
        ui_1.ui.regionSelect.find().click().type("".concat(regionName, "{enter}"));
        cy.get('[data-qa-summary="true"]').within(function () {
            cy.findByText("$10/month").should('be.visible');
        });
        // Confirm there is a docs link to the pricing page
        cy.findByText(dc_specific_pricing_1.dcPricingDocsLabel)
            .should('be.visible')
            .should('have.attr', 'href', dc_specific_pricing_1.dcPricingDocsUrl);
        // Confirms that the summary updates to reflect price changes if the user changes their region.
        ui_1.ui.regionSelect.find().click().clear().type("".concat(newRegion.label, "{enter}"));
        cy.get('[data-qa-summary="true"]').within(function () {
            cy.findByText("$14/month").should('be.visible');
        });
    }
    // this will create the NB in newark, where the default Linode was created
    ui_1.ui.regionSelect.find().click().clear().type("".concat(regionName, "{enter}"));
    // node backend config
    cy.findByText('Label').click();
    cy.focused().type((0, random_1.randomLabel)());
    cy.findByLabelText('IP Address').should('be.visible').click();
    cy.focused().type(nodeBal.ipv4);
    ui_1.ui.autocompletePopper.findByTitle(nodeBal.ipv4).should('be.visible').click();
    deployNodeBalancer();
};
(0, authentication_1.authenticate)();
beforeEach(function () {
    cy.tag('method:e2e', 'purpose:dcTesting');
});
describe('create NodeBalancer', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['tags', 'node-balancers', 'linodes']);
    });
    it('creates a NodeBalancer in a region with base pricing', function () {
        var region = (0, regions_1.chooseRegion)();
        var linodePayload = {
            region: region.id,
            // NodeBalancers require Linodes with private IPs.
            private_ip: true,
        };
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodePayload); }).then(function (linode) {
            var nodeBal = factories_1.nodeBalancerFactory.build({
                label: (0, random_1.randomLabel)(),
                region: region.id,
                ipv4: linode.ipv4[1],
            });
            // catch request
            (0, nodebalancers_1.interceptCreateNodeBalancer)().as('createNodeBalancer');
            createNodeBalancerWithUI(nodeBal);
            cy.wait('@createNodeBalancer')
                .its('response.statusCode')
                .should('eq', 200);
        });
    });
    /*
     * - Confirms label field displays error if it contains special characters.
     * - Confirms session stickiness field displays error if protocol is not HTTP or HTTPS.
     */
    it('displays API errors for NodeBalancer Create form fields', function () {
        var region = factories_1.regionFactory.build({ capabilities: ['NodeBalancers'] });
        var linode = factories_1.linodeFactory.build({ ipv4: ['192.168.1.213'] });
        (0, regions_2.mockGetRegions)([region]);
        (0, linodes_2.mockGetLinodes)([linode]);
        (0, nodebalancers_1.interceptCreateNodeBalancer)().as('createNodeBalancer');
        cy.visitWithLogin('/nodebalancers/create');
        cy.findByLabelText('NodeBalancer Label')
            .should('be.visible')
            .type('my-nodebalancer-1');
        ui_1.ui.autocomplete.findByLabel('Region').should('be.visible').click();
        ui_1.ui.autocompletePopper
            .findByTitle(region.id, { exact: false })
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.findByLabelText('Label').type('my-node-1');
        cy.findByLabelText('IP Address').click();
        cy.focused().type(linode.ipv4[0]);
        ui_1.ui.autocompletePopper.findByTitle(linode.label).click();
        ui_1.ui.button
            .findByTitle('Create NodeBalancer')
            .scrollIntoView()
            .should('be.enabled')
            .should('be.visible')
            .click();
        var expectedError = 'Address Restricted: IP must not be within 192.168.0.0/17';
        cy.wait('@createNodeBalancer')
            .its('response.body')
            .should('deep.equal', {
            errors: [
                { field: 'region', reason: 'region is not valid' },
                { field: 'configs[0].nodes[0].address', reason: expectedError },
            ],
        });
        cy.findByText(expectedError).should('be.visible');
    });
    /*
     * - Confirms DC-specific pricing UI flow works as expected during NodeBalancer creation.
     * - Confirms that pricing docs link is shown in "Region" section.
     */
    it('shows DC-specific pricing information when creating a NodeBalancer', function () {
        var initialRegion = (0, regions_1.getRegionById)('us-west');
        var linodePayload = {
            region: initialRegion.id,
            // NodeBalancers require Linodes with private IPs.
            private_ip: true,
        };
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodePayload); }).then(function (linode) {
            var nodeBal = factories_1.nodeBalancerFactory.build({
                label: (0, random_1.randomLabel)(),
                region: initialRegion.id,
                ipv4: linode.ipv4[1],
            });
            // catch request
            (0, nodebalancers_1.interceptCreateNodeBalancer)().as('createNodeBalancer');
            createNodeBalancerWithUI(nodeBal, true);
        });
    });
});
