"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var account_1 = require("support/intercepts/account");
var linodes_1 = require("support/intercepts/linodes");
var pages_1 = require("support/ui/pages");
var ui_1 = require("support/ui");
var profile_1 = require("support/intercepts/profile");
describe('Create Linode with SSH Key', function () {
    /*
     * - Confirms UI flow when creating a Linode with an authorized SSH key.
     * - Confirms that existing SSH keys are listed on page and can be selected.
     * - Confirms that outgoing Linode create API request contains authorized user for chosen key.
     */
    it('can add an existing SSH key during Linode create flow', function () {
        var linodeRegion = (0, regions_1.chooseRegion)();
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var mockSshKey = factories_1.sshKeyFactory.build({
            label: (0, random_1.randomLabel)(),
        });
        var mockUser = factories_1.accountUserFactory.build({
            username: (0, random_1.randomLabel)(),
            ssh_keys: [mockSshKey.label],
        });
        (0, account_1.mockGetUsers)([mockUser]);
        (0, account_1.mockGetUser)(mockUser);
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Confirm that SSH key is listed, then select it.
        cy.findByText(mockSshKey.label).scrollIntoView();
        cy.findByText(mockSshKey.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(mockUser.username);
            cy.findByLabelText("Enable SSH for ".concat(mockUser.username)).click();
        });
        // Click "Create Linode" button and confirm outgoing request data.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm that outgoing Linode create request contains authorized user that
        // corresponds to the selected SSH key.
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            expect(requestPayload['authorized_users'][0]).to.equal(mockUser.username);
        });
    });
    /*
     * - Confirms UI flow when creating and selecting an SSH key during Linode create flow.
     * - Confirms that new SSH key is automatically shown in Linode create page.
     * - Confirms that outgoing Linode create API request contains authorized user for new key.
     */
    it('can add a new SSH key during Linode create flow', function () {
        var linodeRegion = (0, regions_1.chooseRegion)();
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var mockSshKey = factories_1.sshKeyFactory.build({
            label: (0, random_1.randomLabel)(),
            ssh_key: "ssh-rsa ".concat((0, random_1.randomString)(16)),
        });
        var mockUser = factories_1.accountUserFactory.build({
            username: (0, random_1.randomLabel)(),
            ssh_keys: [],
        });
        var mockUserWithKey = __assign(__assign({}, mockUser), { ssh_keys: [mockSshKey.label] });
        (0, account_1.mockGetUser)(mockUser);
        (0, account_1.mockGetUsers)([mockUser]);
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, profile_1.mockCreateSSHKey)(mockSshKey).as('createSSHKey');
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Confirm that no SSH keys are listed for the mocked user.
        cy.findByText(mockUser.username).scrollIntoView();
        cy.findByText(mockUser.username)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('None').should('be.visible');
            cy.findByLabelText("Enable SSH for ".concat(mockUser.username)).should('be.disabled');
        });
        // Click "Add an SSH Key" and enter a label and the public key, then submit.
        ui_1.ui.button
            .findByTitle('Add an SSH Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        (0, account_1.mockGetUsers)([mockUserWithKey]).as('refetchUsers');
        ui_1.ui.drawer
            .findByTitle('Add SSH Key')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label').type(mockSshKey.label);
            cy.findByLabelText('SSH Public Key').type(mockSshKey.ssh_key);
            ui_1.ui.button
                .findByTitle('Add Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@createSSHKey', '@refetchUsers']);
        // Confirm that the new SSH key is listed, and select it to be added to the Linode.
        cy.findByText(mockSshKey.label).scrollIntoView();
        cy.findByText(mockSshKey.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByLabelText("Enable SSH for ".concat(mockUser.username)).click();
        });
        // Click "Create Linode" button and confirm outgoing request data.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm that outgoing Linode create request contains authorized user that
        // corresponds to the new SSH key.
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            expect(requestPayload['authorized_users'][0]).to.equal(mockUser.username);
        });
    });
});
