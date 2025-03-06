"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var linodes_1 = require("support/intercepts/linodes");
var networking_1 = require("support/intercepts/networking");
var ui_1 = require("support/ui");
var firewalls_1 = require("support/intercepts/firewalls");
var feature_flags_1 = require("support/intercepts/feature-flags");
describe('IP Addresses', function () {
    var _a;
    var mockLinode = factories_1.linodeFactory.build();
    var linodeIPv4 = mockLinode.ipv4[0];
    var mockRDNS = "".concat(linodeIPv4, ".ip.linodeusercontent.com");
    var ipAddress = factories_1.ipAddressFactory.build({
        address: linodeIPv4,
        linode_id: mockLinode.id,
        rdns: mockRDNS,
    });
    var _ipv6Range = {
        prefix: 64,
        range: '2fff:db08:e003:1::',
        region: 'us-east',
        route_target: '2600:3c02::f03c:92ff:fe9d:0f25',
    };
    var ipv6Range = "".concat(_ipv6Range.range, "/").concat(_ipv6Range.prefix);
    var ipv6Address = factories_1.ipAddressFactory.build({
        address: (_a = mockLinode.ipv6) !== null && _a !== void 0 ? _a : '2600:3c00::f03c:92ff:fee2:6c40/64',
        gateway: 'fe80::1',
        linode_id: mockLinode.id,
        prefix: 64,
        subnet_mask: 'ffff:ffff:ffff:ffff::',
        type: 'ipv6',
    });
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeInterfaces: { enabled: false },
        });
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, linodes_1.mockGetLinodeFirewalls)(mockLinode.id, []).as('getLinodeFirewalls');
        (0, linodes_1.mockGetLinodeIPAddresses)(mockLinode.id, {
            ipv4: {
                public: [ipAddress],
                private: [],
                shared: [],
                reserved: [],
            },
            ipv6: {
                global: [_ipv6Range],
                link_local: ipv6Address,
                slaac: ipv6Address,
            },
        }).as('getLinodeIPAddresses');
        (0, networking_1.mockUpdateIPAddress)(linodeIPv4, mockRDNS).as('updateIPAddress');
        cy.visitWithLogin("linodes/".concat(mockLinode.id, "/networking"));
        cy.wait(['@getLinode', '@getLinodeFirewalls', '@getLinodeIPAddresses']);
    });
    /**
     * - Confirms the success toast message after editing RDNS
     */
    it('checks for the toast message upon editing an RDNS', function () {
        cy.findByLabelText('IPv4 Addresses')
            .should('be.visible')
            .within(function () {
            // confirm table headers
            cy.get('thead').findByText('Address').should('be.visible');
            cy.get('thead').findByText('Type').should('be.visible');
            cy.get('thead').findByText('Default Gateway').should('be.visible');
            cy.get('thead').findByText('Subnet Mask').should('be.visible');
            cy.get('thead').findByText('Reverse DNS').should('be.visible');
        });
        // confirm row for Linode's (first) IPv4 address exists and open up the RDNS drawer
        cy.get("[data-qa-ip=\"".concat(linodeIPv4, "\"]"))
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('IPv4 – Public').should('be.visible');
            cy.findByText(mockRDNS).should('be.visible');
            // open up the edit RDNS drawer
            ui_1.ui.button.findByTitle('Edit RDNS').should('be.visible').click();
        });
        // confirm RDNS drawer is visible
        ui_1.ui.drawer
            .findByTitle('Edit Reverse DNS')
            .should('be.visible')
            .within(function () {
            cy.findByText('Leave this field blank to reset RDNS').should('be.visible');
            // click Save button - this test is only to confirm the toast message
            // and intentionally doesn't edit the RDNS form. Note - although we're using
            // mocks here, with actual data, I would get an error each time I tried to edit the RDNS
            cy.findByText('Save').should('be.visible').should('be.enabled').click();
        });
        cy.wait(['@updateIPAddress']);
        // confirm RDNS toast message
        ui_1.ui.toast.assertMessage("Successfully updated RDNS for ".concat(linodeIPv4));
    });
    it('validates the action menu title (aria-label) for the IP address in the table row', function () {
        // Set the viewport to 1279px x 800px (width < 1280px) to ensure the Action menu is visible.
        cy.viewport(1279, 800);
        // Ensure the action menu has the correct aria-label for the IP address.
        cy.get("[data-qa-ip=\"".concat(linodeIPv4, "\"]"))
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('IPv4 – Public').should('be.visible');
            ui_1.ui.actionMenu
                .findByTitle("Action menu for IP Address ".concat(linodeIPv4))
                .should('be.visible');
        });
        // Ensure the action menu has the correct aria-label for the IP Range.
        cy.get("[data-qa-ip=\"".concat(ipv6Range, "\"]"))
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('IPv6 – Range').should('be.visible');
            ui_1.ui.actionMenu
                .findByTitle("Action menu for IP Address ".concat(_ipv6Range.range))
                .should('be.visible');
        });
    });
});
describe('Firewalls', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeInterfaces: { enabled: false },
        });
    });
    it('allows the user to assign a Firewall from the Linode details page', function () {
        var linode = factories_1.linodeFactory.build();
        var firewalls = factories_1.firewallFactory.buildList(3);
        var firewallToAttach = firewalls[1];
        var firewallDevice = factories_1.firewallDeviceFactory.build({
            entity: { id: linode.id, type: 'linode' },
        });
        (0, linodes_1.mockGetLinodeDetails)(linode.id, linode).as('getLinode');
        (0, linodes_1.mockGetLinodeFirewalls)(linode.id, []).as('getLinodeFirewalls');
        (0, firewalls_1.mockGetFirewalls)(firewalls).as('getFirewalls');
        (0, firewalls_1.mockAddFirewallDevice)(firewallToAttach.id, firewallDevice).as('addFirewallDevice');
        cy.visitWithLogin("/linodes/".concat(linode.id, "/networking"));
        cy.wait(['@getLinode', '@getLinodeFirewalls']);
        cy.findByText('No Firewalls are assigned.').should('be.visible');
        ui_1.ui.button
            .findByTitle('Add Firewall')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Firewalls should fetch when the drawer's contents are mounted
        cy.wait('@getFirewalls');
        (0, linodes_1.mockGetLinodeFirewalls)(linode.id, [firewallToAttach]).as('getLinodeFirewalls');
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
            expect(requestPayload.id).to.equal(linode.id);
            expect(requestPayload.type).to.equal('linode');
        });
        ui_1.ui.toast.assertMessage('Successfully assigned Firewall');
        // The Linode's firewalls list should be invalidated after the new firewall device was added
        cy.wait('@getLinodeFirewalls');
        // Verify the firewall shows up in the table
        cy.findAllByText(firewallToAttach.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Unassign').should('be.visible').should('be.enabled');
        });
        // The "Add Firewall" button should now be disabled beause the Linode has a firewall attached
        ui_1.ui.button
            .findByTitle('Add Firewall')
            .should('be.visible')
            .should('be.disabled');
    });
});
