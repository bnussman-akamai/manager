"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_v4_1 = require("@linode/api-v4");
var factories_1 = require("src/factories");
var formatDate_1 = require("src/utilities/formatDate");
var authentication_1 = require("support/api/authentication");
var linodes_1 = require("support/intercepts/linodes");
var profile_1 = require("support/intercepts/profile");
var stackscripts_1 = require("support/intercepts/stackscripts");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var mockStackScripts = [
    factories_1.stackScriptFactory.build({
        id: 443929,
        username: 'litespeed',
        user_gravatar_id: 'f7360fb588b5f65d81ee1afe11b6c0ad',
        label: 'OpenLiteSpeed-WordPress',
        description: 'Blazing-fast WordPress with LSCache, 300+ times faster than regular WordPress\n\nOpenLiteSpeed is the Open Source edition of LiteSpeed Web Server Enterprise and contains all of the essential features. OLS provides enormous scalability, and an accelerated hosting platform for WordPress. \n\nWhole process maybe take up to 10 minutes to finish. ',
        ordinal: 0,
        logo_url: '',
        images: [
            'linode/centos7',
            'linode/debian9',
            'linode/ubuntu18.04',
            'linode/debian10',
            'linode/centos8',
            'linode/ubuntu20.04',
            'linode/centos-stream8',
            'linode/almalinux8',
            'linode/rocky8',
            'linode/debian11',
            'linode/centos-stream9',
            'linode/ubuntu24.04',
            'linode/almalinux9',
            'linode/rocky9',
        ],
        deployments_total: 4400,
        deployments_active: 238,
        is_public: true,
        mine: false,
        created: '2019-05-23T16:21:41',
        updated: '2023-08-22T16:41:48',
        rev_note: 'add more OS',
        script: '#!/bin/bash\n### linode\n### Install OpenLiteSpeed and WordPress\nbash <( curl -sk https://raw.githubusercontent.com/litespeedtech/ls-cloud-image/master/Setup/wpimgsetup.sh )\n### Regenerate password for Web Admin, Database, setup Welcome Message\nbash <( curl -sk https://raw.githubusercontent.com/litespeedtech/ls-cloud-image/master/Cloud-init/per-instance.sh )\n### Reboot server\nreboot\n',
        user_defined_fields: [],
    }),
    factories_1.stackScriptFactory.build({
        id: 68166,
        username: 'serverok',
        user_gravatar_id: '8c2562f63286df4f8aae5babe5920ade',
        label: 'Squid Proxy Server',
        description: 'Auto setup Squid Proxy Server on Ubuntu 16.04 LTS',
        ordinal: 0,
        logo_url: '',
        images: ['linode/ubuntu16.04lts'],
        deployments_total: 35469,
        deployments_active: 13,
        is_public: true,
        mine: false,
        created: '2017-02-07T02:28:49',
        updated: '2023-08-07T02:34:15',
        rev_note: 'Initial import',
        script: '#!/bin/bash\n# <UDF name="squid_user" Label="Proxy Username" />\n# <UDF name="squid_password" Label="Proxy Password" />\n# Squid Proxy Server\n# Author: admin@serverok.in\n# Blog: https://www.serverok.in\n\n\n/usr/bin/apt update\n/usr/bin/apt -y install apache2-utils squid3\n\n/usr/bin/htpasswd -b -c /etc/squid/passwd $SQUID_USER $SQUID_PASSWORD\n\n/bin/rm -f /etc/squid/squid.conf\n/usr/bin/touch /etc/squid/blacklist.acl\n/usr/bin/wget --no-check-certificate -O /etc/squid/squid.conf https://raw.githubusercontent.com/hostonnet/squid-proxy-installer/master/squid.conf\n\n/sbin/iptables -I INPUT -p tcp --dport 3128 -j ACCEPT\n/sbin/iptables-save\n\nservice squid restart\nupdate-rc.d squid defaults',
        user_defined_fields: [
            {
                name: 'squid_user',
                label: 'Proxy Username',
            },
            {
                name: 'squid_password',
                label: 'Proxy Password',
            },
        ],
    }),
];
(0, authentication_1.authenticate)();
describe('Community Stackscripts integration tests', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes']);
    });
    /*
     * - Displays Community StackScripts in the landing page.
     * - Confirms that Community page is not empty.
     */
    it('displays Community StackScripts with expected flows', function () {
        var stackScript = mockStackScripts[0];
        (0, stackscripts_1.mockGetStackScripts)(mockStackScripts).as('getStackScripts');
        cy.visitWithLogin('/stackscripts/community');
        cy.wait('@getStackScripts');
        // Confirm that empty state is not shown.
        cy.get('[data-qa-placeholder-container="resources-section"]').should('not.exist');
        cy.findByText('Automate deployment scripts').should('not.exist');
        cy.defer(api_v4_1.getProfile, 'getting profile').then(function (profile) {
            var dateFormatOptionsLanding = {
                timezone: profile.timezone,
                displayTime: false,
            };
            var dateFormatOptionsDetails = {
                timezone: profile.timezone,
                displayTime: true,
            };
            var updatedTimeLanding = (0, formatDate_1.formatDate)(stackScript.updated, dateFormatOptionsLanding);
            var updatedTimeDetails = (0, formatDate_1.formatDate)(stackScript.updated, dateFormatOptionsDetails);
            cy.get("[data-qa-table-row=\"".concat(stackScript.label, "\"]"))
                .should('be.visible')
                .within(function () {
                cy.findByText(stackScript.deployments_total).should('be.visible');
                cy.findByText(updatedTimeLanding).should('be.visible');
            });
            // Search the corresponding community stack script
            (0, stackscripts_1.mockGetStackScripts)([stackScript]).as('getFilteredStackScripts');
            cy.findByPlaceholderText('Search by Label, Username, or Description')
                .click()
                .type("".concat(stackScript.label, "{enter}"));
            cy.wait('@getFilteredStackScripts');
            // Check filtered results
            cy.get("[data-qa-table-row=\"".concat(mockStackScripts[1].label, "\"]")).should('not.exist');
            (0, stackscripts_1.mockGetStackScript)(stackScript.id, stackScript).as('getStackScript');
            cy.get("[href=\"/stackscripts/".concat(stackScript.id, "\"]"))
                .should('be.visible')
                .click();
            cy.wait('@getStackScript');
            // Check the details page of the community stackscript
            cy.get("[data-qa-stack-author=\"".concat(stackScript.username, "\"]")).should('be.visible');
            cy.get('[data-qa-stack-deployments="true"]').within(function () {
                cy.findByText('deployments')
                    .should('be.visible')
                    .within(function () {
                    cy.findByText(stackScript.deployments_total).should('be.visible');
                });
                cy.findByText('still active')
                    .should('be.visible')
                    .within(function () {
                    cy.findByText(stackScript.deployments_active).should('be.visible');
                });
                cy.findByText('Last revision:')
                    .should('be.visible')
                    .parent()
                    .within(function () {
                    cy.findByText(updatedTimeDetails).should('be.visible');
                });
                cy.findByText('StackScript ID:')
                    .should('be.visible')
                    .parent()
                    .within(function () {
                    cy.findByText(stackScript.id).should('be.visible');
                });
            });
        });
    });
    /*
     * - Scrolls Community StackScripts landing page.
     * - Confirms that pagination works as expected.
     */
    it('pagination works with infinite scrolling', function () {
        cy.tag('method:e2e');
        (0, stackscripts_1.interceptGetStackScripts)().as('getStackScripts');
        // Fetch all public Images to later use while filtering StackScripts.
        cy.visitWithLogin('/stackscripts/community');
        cy.wait('@getStackScripts');
        // Confirm that empty state is not shown.
        cy.get('[data-qa-placeholder-container="resources-section"]').should('not.exist');
        cy.findByText('Automate deployment scripts').should('not.exist');
        // Confirm that scrolling to the bottom of the StackScripts list causes
        // pagination to occur automatically. Perform this check 3 times.
        for (var i = 0; i < 3; i += 1) {
            cy.findByLabelText('List of StackScripts')
                .should('be.visible')
                .within(function () {
                // Scroll to the bottom of the StackScripts list, confirm Cloud fetches StackScripts,
                // then confirm that list updates with the new StackScripts shown.
                cy.get('tr').last().scrollIntoView();
                cy.wait('@getStackScripts').then(function (xhr) {
                    var _a;
                    var stackScripts = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body['data'];
                    if (!stackScripts) {
                        throw new Error('Unexpected response received when fetching StackScripts');
                    }
                    cy.contains("".concat(stackScripts[0].username, " / ").concat(stackScripts[0].label)).should('be.visible');
                });
            });
        }
    });
    /*
     * - Searhes Community StackScripts in the landing page.
     * - Confirms that search can filter the expected results.
     */
    it('search function filters results correctly', function () {
        cy.tag('method:e2e');
        var stackScript = mockStackScripts[0];
        (0, stackscripts_1.interceptGetStackScripts)().as('getStackScripts');
        cy.visitWithLogin('/stackscripts/community');
        cy.wait('@getStackScripts');
        // Confirm that empty state is not shown.
        cy.get('[data-qa-placeholder-container="resources-section"]').should('not.exist');
        cy.findByText('Automate deployment scripts').should('not.exist');
        cy.get('tr').then(function (value) {
            var rowCount = Cypress.$(value).length - 1; // Remove the table title row
            cy.findByPlaceholderText('Search by Label, Username, or Description')
                .click()
                .type("".concat(stackScript.label, "{enter}"));
            cy.get("[data-qa-table-row=\"".concat(stackScript.label, "\"]")).should('be.visible');
            cy.get('tr').its('length').should('be.lt', rowCount);
        });
    });
    /*
     * - Deploys a Linode from Community StackScripts.
     * - Confirms that the deployment flow works.
     */
    it('deploys a new linode as expected', function () {
        var stackScriptId = '37239';
        var stackScriptName = 'setup-ipsec-vpn';
        var sharedKey = (0, random_1.randomString)();
        var vpnUser = (0, random_1.randomLabel)();
        var vpnPassword = (0, random_1.randomString)(16);
        var weakPassword = '123';
        var fairPassword = 'Akamai123';
        var rootPassword = (0, random_1.randomString)(16);
        var image = 'AlmaLinux 9';
        var region = (0, regions_1.chooseRegion)({ capabilities: ['Vlans'] });
        var linodeLabel = (0, random_1.randomLabel)();
        // Ensure that the Primary Nav is open
        (0, profile_1.mockGetUserPreferences)({ desktop_sidebar_open: false }).as('getPreferences');
        (0, stackscripts_1.interceptGetStackScripts)().as('getStackScripts');
        cy.visitWithLogin('/stackscripts/community');
        cy.wait(['@getStackScripts', '@getPreferences']);
        cy.findByPlaceholderText('Search by Label, Username, or Description')
            .click()
            .type("".concat(stackScriptName, "{enter}"));
        cy.get("[data-qa-table-row=\"".concat(stackScriptName, "\"]"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Deploy New Linode')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.url().should('endWith', "linodes/create?type=StackScripts&subtype=Community&stackScriptID=".concat(stackScriptId));
        });
        ui_1.ui.nav.findItemByTitle('StackScripts').should('be.visible').click();
        ui_1.ui.tabList
            .findTabByTitle('Community StackScripts')
            .should('be.visible')
            .click();
        cy.url().should('endWith', '/stackscripts/community');
        cy.get("[href=\"/stackscripts/".concat(stackScriptId, "\"]"))
            .should('be.visible')
            .click();
        ui_1.ui.button
            .findByTitle('Deploy New Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', "linodes/create?type=StackScripts&subtype=Community&stackScriptID=".concat(stackScriptId));
        // Input VPN information
        cy.get('[id="ipsec-pre-shared-key"]')
            .should('be.visible')
            .click()
            .type("".concat(sharedKey, "{enter}"));
        cy.get('[id="vpn-username"]')
            .should('be.visible')
            .click()
            .type("".concat(vpnUser, "{enter}"));
        cy.get('[id="vpn-password"]')
            .should('be.visible')
            .click()
            .type("".concat(vpnPassword, "{enter}"));
        // Check each field should persist when moving onto another field
        cy.get('[id="ipsec-pre-shared-key"]').should('have.value', sharedKey);
        cy.get('[id="vpn-username"]').should('have.value', vpnUser);
        cy.get('[id="vpn-password"]').should('have.value', vpnPassword);
        // Choose an image
        cy.findByPlaceholderText('Choose an image')
            .should('be.visible')
            .click()
            .type(image);
        ui_1.ui.autocompletePopper.findByTitle(image).should('be.visible').click();
        cy.findByText(image).should('be.visible').click();
        // Choose a region
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // An error message shows up when no region is selected
        cy.contains('Region is required.').should('be.visible');
        ui_1.ui.regionSelect.find().click().type("".concat(region.id, "{enter}"));
        // Choose a plan
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Enter a label.
        cy.findByText('Linode Label')
            .should('be.visible')
            .click()
            .type('{selectAll}{backspace}')
            .type(linodeLabel);
        // An error message shows up when no region is selected
        cy.contains('Plan is required.').should('be.visible');
        cy.get('[data-qa-plan-row="Dedicated 8 GB"]')
            .closest('tr')
            .within(function () {
            cy.get('[data-qa-radio]').click();
        });
        // Input root password
        // Weak or fair root password cannot rebuild the linode
        cy.get('[id="root-password"]').clear().type(weakPassword);
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.findByText('Password does not meet', { exact: false }).should('be.visible');
        cy.get('[id="root-password"]').clear().type(fairPassword);
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.findByText('Password does not meet', { exact: false }).should('be.visible');
        // Only strong password is allowed to rebuild the linode
        cy.get('[id="root-password"]').type(rootPassword);
        (0, linodes_1.interceptCreateLinode)().as('createLinode');
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode');
        ui_1.ui.toast.assertMessage("Your Linode ".concat(linodeLabel, " is being created."));
    });
});
