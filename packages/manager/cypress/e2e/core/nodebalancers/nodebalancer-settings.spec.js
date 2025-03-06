"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var firewalls_1 = require("support/intercepts/firewalls");
var nodebalancers_1 = require("support/intercepts/nodebalancers");
var ui_1 = require("support/ui");
describe('Firewalls', function () {
    it('allows the user to assign a Firewall from the NodeBalancer settings page', function () {
        var nodebalancer = factories_1.nodeBalancerFactory.build();
        var firewalls = factories_1.firewallFactory.buildList(3);
        var firewallToAttach = firewalls[1];
        var firewallDevice = factories_1.firewallDeviceFactory.build({
            entity: { id: nodebalancer.id, type: 'nodebalancer' },
        });
        (0, nodebalancers_1.mockGetNodeBalancer)(nodebalancer).as('getNodeBalancer');
        (0, nodebalancers_1.mockGetNodeBalancerFirewalls)(nodebalancer.id, []).as('getNodeBalancerFirewalls');
        (0, firewalls_1.mockGetFirewalls)(firewalls).as('getFirewalls');
        (0, firewalls_1.mockAddFirewallDevice)(firewallToAttach.id, firewallDevice).as('addFirewallDevice');
        cy.visitWithLogin("/nodebalancers/".concat(nodebalancer.id, "/settings"));
        cy.wait(['@getNodeBalancer', '@getNodeBalancerFirewalls']);
        cy.findByText('No Firewalls are assigned.').should('be.visible');
        ui_1.ui.button
            .findByTitle('Add Firewall')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Firewalls should fetch when the drawer's contents are mounted
        cy.wait('@getFirewalls');
        (0, nodebalancers_1.mockGetNodeBalancerFirewalls)(nodebalancer.id, [firewallToAttach]).as('getNodeBalancerFirewalls');
        ui_1.ui.drawer.findByTitle('Add Firewall').within(function () {
            cy.findByLabelText('Firewall').should('be.visible').click();
            // Verify all firewalls show in the Select
            for (var _i = 0, firewalls_2 = firewalls; _i < firewalls_2.length; _i++) {
                var firewall = firewalls_2[_i];
                ui_1.ui.autocompletePopper
                    .findByTitle(firewall.label)
                    .should('be.visible')
                    .should('be.enabled');
            }
            ui_1.ui.autocompletePopper.findByTitle(firewallToAttach.label).click();
            ui_1.ui.buttonGroup.find().within(function () {
                ui_1.ui.button
                    .findByTitle('Add Firewall')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
        });
        // Verify the request has the correct payload
        cy.wait('@addFirewallDevice').then(function (xhr) {
            var requestPayload = xhr.request.body;
            expect(requestPayload.id).to.equal(nodebalancer.id);
            expect(requestPayload.type).to.equal('nodebalancer');
        });
        ui_1.ui.toast.assertMessage('Successfully assigned Firewall');
        // The NodeBalancer's firewalls list should be invalidated after the new firewall device was added
        cy.wait('@getNodeBalancerFirewalls');
        // Verify the firewall shows up in the table
        cy.findByText(firewallToAttach.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Unassign').should('be.visible').should('be.enabled');
        });
        // The "Add Firewall" button should now be disabled beause the NodeBalancer has a firewall attached
        ui_1.ui.button
            .findByTitle('Add Firewall')
            .should('be.visible')
            .should('be.disabled');
    });
});
