"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pages = exports.routes = exports.loadAppNoLogin = void 0;
var common_1 = require("./common");
var loadAppNoLogin = function (path) { return (0, common_1.waitForAppLoad)(path, false); };
exports.loadAppNoLogin = loadAppNoLogin;
/* eslint-disable sonarjs/no-duplicate-string */
exports.routes = {
    account: '/account',
    createLinode: '/linodes/create',
    createLinodeOCA: '/linodes/create?type=One-Click',
    linodeLanding: '/linodes',
    profile: '/profile',
    support: '/support',
    supportTickets: '/support/tickets',
    supportTicketsClosed: '/support/tickets?type=closed',
    supportTicketsOpen: '/support/tickets?type=open',
};
/**
 * due 2 rerender of the page that i could not deterministically check i added this wait
 * @todo find a better way
 */
var waitDoubleRerender = function () {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
};
// List of Routes and validator of the route
exports.pages = [
    {
        assertIsLoaded: function () { return cy.findByText('Choose an OS').should('be.visible'); },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.createLinodeOCA);
                    cy.findByText('OS').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Linode/Create/OS',
        url: "".concat(exports.routes.createLinode, "?type=OS"),
    },
    {
        assertIsLoaded: function () { return cy.findByText('Select App').should('be.visible'); },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.createLinode);
                    cy.get('[data-reach-tab]').contains('Marketplace').click();
                },
                name: 'Tab',
            },
            {
                go: function () {
                    // going to a page that loads easily, not dashboard for faster test
                    (0, exports.loadAppNoLogin)(exports.routes.support);
                    cy.get('[data-qa-add-new-menu-button="true"]')
                        .should('be.visible')
                        .click();
                    cy.get('[data-qa-one-click-add-new="true"]')
                        .should('be.visible')
                        .click();
                },
                name: 'Create Button',
            },
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.support);
                    cy.findByText('Create').click();
                    cy.get('[data-qa-one-click-add-new="true"]').click();
                },
                name: 'Nav',
            },
        ],
        name: 'Linode/Create/OCA',
        url: exports.routes.createLinodeOCA,
    },
    {
        assertIsLoaded: function () { return cy.findByText('Choose an Image').should('be.visible'); },
        name: 'Linode/Create/FromImages',
        url: "".concat(exports.routes.createLinode, "?type=Images"),
    },
    {
        assertIsLoaded: function () { return cy.findByText('Select Backup').should('be.visible'); },
        name: 'Linode/Create/FromBackup',
        url: "".concat(exports.routes.createLinode, "?type=Backups"),
    },
    {
        assertIsLoaded: function () {
            return cy.findByText('Select Linode to Clone From').should('be.visible');
        },
        name: 'Linode/Create/Clone',
        url: "".concat(exports.routes.createLinode, "?type=Clone%20Linode"),
    },
    {
        assertIsLoaded: function () { return cy.findByText('My Profile').should('be.visible'); },
        name: 'Profile',
        url: "".concat(exports.routes.profile),
    },
    {
        assertIsLoaded: function () { return cy.findByText('Username').should('be.visible'); },
        goWithUI: [
            {
                go: function () {
                    var url = "".concat(exports.routes.profile, "/auth");
                    (0, exports.loadAppNoLogin)(url);
                    cy.get('[data-qa-header="My Profile"]').should('be.visible');
                    cy.contains('How to Enable Third Party Authentication on Your User Account').should('be.visible');
                    waitDoubleRerender();
                    cy.contains('Display').should('be.visible').click();
                },
                name: 'Tab',
            },
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.support);
                    cy.findByTestId('nav-group-profile').click();
                    cy.findByTestId('menu-item-Display')
                        .should('have.text', 'Display')
                        .click({ force: true });
                },
                name: 'User Profile Button',
            },
        ],
        name: 'Profile/Display',
        url: "".concat(exports.routes.profile, "/display"),
    },
    {
        assertIsLoaded: function () {
            return cy.findByText('Account Password').should('be.visible');
        },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.profile);
                    cy.findByText('Username').should('be.visible');
                    waitDoubleRerender();
                    cy.contains('Login & Authentication').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Profile/Password',
        url: "".concat(exports.routes.profile, "/auth"),
    },
    {
        assertIsLoaded: function () { return cy.findByText('Add an SSH Key').should('be.visible'); },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.profile);
                    cy.findByText('Username');
                    waitDoubleRerender();
                    cy.contains('SSH Keys').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Profile/SSH Keys',
        url: "".concat(exports.routes.profile, "/keys"),
    },
    {
        assertIsLoaded: function () {
            return cy.findByText('Authentication Mode').should('be.visible');
        },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.profile);
                    cy.findByText('Username');
                    waitDoubleRerender();
                    cy.contains('LISH Console Settings').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Profile/LISH',
        url: "".concat(exports.routes.profile, "/lish"),
    },
    {
        assertIsLoaded: function () {
            return cy.findByText('Add a Personal Access Token').should('be.visible');
        },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.profile);
                    cy.findByText('Username');
                    waitDoubleRerender();
                    cy.contains('API Tokens').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Profile/API Tokens',
        url: "".concat(exports.routes.profile, "/tokens"),
    },
    {
        assertIsLoaded: function () {
            return cy.findByText('Other Ways to Get Help').should('be.visible');
        },
        name: 'Support',
        url: "".concat(exports.routes.support),
    },
    {
        assertIsLoaded: function () { return cy.findByText('Open New Ticket').should('be.visible'); },
        name: 'Support/Tickets',
        url: "".concat(exports.routes.supportTickets),
    },
    {
        assertIsLoaded: function () { return cy.findByText('Open New Ticket').should('be.visible'); },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.supportTicketsOpen);
                    cy.findByText('Open Tickets').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Support/Tickets/Open',
        url: "".concat(exports.routes.supportTicketsOpen),
    },
    {
        assertIsLoaded: function () { return cy.findByText('Open New Ticket').should('be.visible'); },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)(exports.routes.supportTicketsClosed);
                    cy.findByText('Closed Tickets').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Support/Tickets/Closed',
        url: "".concat(exports.routes.supportTicketsClosed),
    },
    {
        assertIsLoaded: function () { return cy.findByText('Billing Info').should('be.visible'); },
        name: 'Account',
        url: "".concat(exports.routes.account),
    },
    {
        assertIsLoaded: function () {
            return cy.findByText('Update Contact Information').should('be.visible');
        },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)("".concat(exports.routes.account, "/users"));
                    cy.findByText('Username');
                    waitDoubleRerender();
                    cy.findByText('Billing Info').should('be.visible').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Account/Billing',
        url: "".concat(exports.routes.account, "/billing"),
    },
    {
        assertIsLoaded: function () { return cy.findByText('Add a User').should('be.visible'); },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)("".concat(exports.routes.account, "/billing"));
                    cy.findByText('Billing Contact');
                    waitDoubleRerender();
                    cy.get('[data-reach-tab]').contains('Users').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Account/Users',
        url: "".concat(exports.routes.account, "/users"),
    },
    {
        assertIsLoaded: function () {
            return cy.findByText('Backup Auto Enrollment').should('be.visible');
        },
        goWithUI: [
            {
                go: function () {
                    (0, exports.loadAppNoLogin)("".concat(exports.routes.account, "/billing"));
                    cy.findByText('Billing Contact');
                    waitDoubleRerender();
                    cy.contains('Settings').click();
                },
                name: 'Tab',
            },
        ],
        name: 'Account/Settings',
        url: "".concat(exports.routes.account, "/settings"),
    },
];
