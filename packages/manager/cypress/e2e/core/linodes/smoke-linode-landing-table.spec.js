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
var accountSettings_1 = require("@src/factories/accountSettings");
var linodes_1 = require("@src/factories/linodes");
var serverHandlers_1 = require("@src/mocks/serverHandlers");
var ui_1 = require("support/ui");
var constants_1 = require("support/ui/constants");
var intercepts_1 = require("support/util/intercepts");
var regions_1 = require("support/util/regions");
var authentication_1 = require("support/api/authentication");
var linodes_2 = require("support/intercepts/linodes");
var factories_1 = require("@src/factories");
var accountUsers_1 = require("@src/factories/accountUsers");
var grants_1 = require("@src/factories/grants");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var random_1 = require("support/util/random");
var commonLocators = require("support/ui/locators/common-locators");
var linodeLocators = require("support/ui/locators/linode-locators");
var feature_flags_1 = require("support/intercepts/feature-flags");
var mockLinodes = new Array(5).fill(null).map(function (_item, index) {
    return linodes_1.linodeFactory.build({
        label: "Linode ".concat(index),
        region: (0, regions_1.chooseRegion)().id,
        tags: [index % 2 == 0 ? 'even' : 'odd', 'nums'],
    });
});
var mockLinodesData = (0, serverHandlers_1.makeResourcePage)(mockLinodes);
var sortByRegion = function (a, b) {
    return a.region.localeCompare(b.region);
};
var sortByLabel = function (a, b) {
    return a.label.localeCompare(b.label);
};
var linodeLabel = function (index) {
    return mockLinodes[index - 1].label;
};
var preferenceOverrides = {
    linodes_view_style: 'list',
    linodes_group_by_tag: false,
    volumes_group_by_tag: false,
    desktop_sidebar_open: false,
    sortKeys: {
        'linodes-landing': { order: 'asc', orderBy: 'label' },
        volume: { order: 'asc', orderBy: 'label' },
    },
};
(0, authentication_1.authenticate)();
describe('linode landing checks', function () {
    beforeEach(function () {
        var mockAccountSettings = accountSettings_1.accountSettingsFactory.build({
            managed: false,
        });
        cy.intercept('GET', (0, intercepts_1.apiMatcher)('account/settings'), function (req) {
            req.reply(mockAccountSettings);
        }).as('getAccountSettings');
        cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile')).as('getProfile');
        cy.intercept('GET', (0, intercepts_1.apiMatcher)('linode/instances/*'), function (req) {
            req.reply(mockLinodesData);
        }).as('getLinodes');
        cy.visitWithLogin('/', { preferenceOverrides: preferenceOverrides });
        cy.wait('@getAccountSettings');
        cy.wait('@getLinodes');
        cy.url().should('endWith', constants_1.routes.linodeLanding);
    });
    it('checks the landing page side menu items', function () {
        cy.findByTitle('Akamai - Dashboard').should('be.visible');
        cy.findByTestId('menu-item-Linodes').should('be.visible');
        cy.findByTestId('menu-item-Volumes').should('be.visible');
        cy.findByTestId('menu-item-NodeBalancers').should('be.visible');
        cy.findByTestId('menu-item-Firewalls').should('be.visible');
        cy.findByTestId('menu-item-StackScripts').should('be.visible');
        cy.findByTestId('menu-item-Images').should('be.visible');
        cy.findByTestId('menu-item-Domains').should('be.visible');
        cy.findByTestId('menu-item-Kubernetes').should('be.visible');
        cy.findByTestId('menu-item-Object Storage').should('be.visible');
        cy.findByTestId('menu-item-Longview').should('be.visible');
        cy.findByTestId('menu-item-Marketplace').should('be.visible');
        cy.findByTestId('menu-item-Account').scrollIntoView();
        cy.findByTestId('menu-item-Account').should('be.visible');
        cy.findByTestId('menu-item-Help & Support').should('be.visible');
    });
    it('checks the landing top menu items', function () {
        cy.wait('@getProfile').then(function (xhr) {
            var _a;
            var username = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.username;
            cy.get(commonLocators.topMenuItemsLocator.toggleSideMenuButton).should('be.visible');
            cy.get(commonLocators.topMenuItemsLocator.addNewMenuButton).should('be.visible');
            cy.get(commonLocators.topMenuItemsLocator.searchIcon).should('be.visible');
            ui_1.ui.mainSearch.find().should('be.visible');
            cy.findByLabelText('Help & Support').should('be.enabled').click();
            cy.url().should('endWith', '/support');
            cy.go('back');
            // Cypress cannot work with other tabs and windows, so we can't test
            // that this takes the user to the expected place since it has no `href`
            // attribute.
            cy.findByLabelText('Linode Cloud Community - link opens in a new tab')
                .should('be.visible')
                .should('be.enabled');
            cy.get(commonLocators.topMenuItemsLocator.notificationsButton).should('be.visible');
            cy.findByTestId('nav-group-profile')
                .should('be.visible')
                .within(function () {
                cy.findByText(username).should('be.visible');
            });
        });
    });
    it('checks the landing labels and buttons', function () {
        cy.get(linodeLocators.nonEmptyLinodePage.linodesLabel).should('be.visible');
        cy.get(linodeLocators.nonEmptyLinodePage.docsLink).should('be.visible');
        cy.findByText('Create Linode').should('be.visible');
    });
    it('checks label and region sorting behavior for linode table', function () {
        var linodesByLabel = __spreadArray([], mockLinodes.sort(sortByLabel), true);
        var linodesByRegion = __spreadArray([], mockLinodes.sort(sortByRegion), true);
        var linodesLastIndex = mockLinodes.length - 1;
        var firstLinodeLabel = linodesByLabel[0].label;
        var lastLinodeLabel = linodesByLabel[linodesLastIndex].label;
        var firstRegionLabel = (0, regions_1.getRegionById)(linodesByRegion[0].region).label;
        var lastRegionLabel = (0, regions_1.getRegionById)(linodesByRegion[linodesLastIndex].region).label;
        var checkFirstRow = function (label) {
            cy.get(linodeLocators.listOfLinodesTableBody.rows)
                .should('be.visible')
                .first()
                .within(function () {
                cy.contains(label).should('be.visible');
            });
        };
        var checkLastRow = function (label) {
            cy.get(linodeLocators.listOfLinodesTableBody.rows)
                .should('be.visible')
                .last()
                .within(function () {
                cy.contains(label).should('be.visible');
            });
        };
        checkFirstRow(firstLinodeLabel);
        checkLastRow(lastLinodeLabel);
        cy.get(linodeLocators.listOfLinodesTableHeader.labelSortButton).click();
        checkFirstRow(lastLinodeLabel);
        checkLastRow(firstLinodeLabel);
        // Region sorting ascending order
        cy.get(linodeLocators.listOfLinodesTableHeader.regionSortButton).click();
        checkFirstRow(firstRegionLabel);
        checkLastRow(lastRegionLabel);
        // Region sorting descending order
        cy.get(linodeLocators.listOfLinodesTableHeader.regionSortButton).click();
        checkFirstRow(lastRegionLabel);
        checkLastRow(firstRegionLabel);
    });
    it('checks the create menu dropdown items', function () {
        cy.get(commonLocators.topMenuItemsLocator.addNewMenuButton).click();
        cy.get(commonLocators.topMenuCreateItemsLocator.createMenu)
            .should('be.visible')
            .within(function () {
            cy.get(commonLocators.topMenuCreateItemsLocator.linodesLink)
                .should('be.visible')
                .within(function () {
                cy.findByText('Linode').should('be.visible');
                cy.findByText('High performance SSD Linux servers').should('be.visible');
            });
            cy.get(commonLocators.topMenuCreateItemsLocator.volumesLink)
                .should('be.visible')
                .within(function () {
                cy.findByText('Volume').should('be.visible');
                cy.findByText('Attach additional storage to your Linode').should('be.visible');
            });
            cy.get(commonLocators.topMenuCreateItemsLocator.nodeBalancersLink)
                .should('be.visible')
                .within(function () {
                cy.findByText('NodeBalancer').should('be.visible');
                cy.findByText('Ensure your services are highly available').should('be.visible');
            });
            cy.get(commonLocators.topMenuCreateItemsLocator.firewallsLink)
                .should('be.visible')
                .within(function () {
                cy.findByText('Firewall').should('be.visible');
                cy.findByText('Control network access to your Linodes').should('be.visible');
            });
            cy.get(commonLocators.topMenuCreateItemsLocator.domainsLink)
                .should('be.visible')
                .within(function () {
                cy.findByText('Domain').should('be.visible');
                cy.findByText('Manage your DNS records').should('be.visible');
            });
            cy.get(commonLocators.topMenuCreateItemsLocator.kubernetesLink)
                .should('be.visible')
                .within(function () {
                cy.findByText('Kubernetes').should('be.visible');
                cy.findByText('Highly available container workloads').should('be.visible');
            });
            cy.get(commonLocators.topMenuCreateItemsLocator.bucketsLink)
                .should('be.visible')
                .within(function () {
                cy.findByText('Bucket').should('be.visible');
                cy.findByText('S3-compatible object storage').should('be.visible');
            });
            cy.get(commonLocators.topMenuCreateItemsLocator.marketplaceOneClickLink)
                .should('be.visible')
                .within(function () {
                cy.findByText('Marketplace').should('be.visible');
                cy.findByText('Deploy applications with ease').should('be.visible');
            });
        });
    });
    it('checks the table and action menu buttons/labels', function () {
        var label = linodeLabel(1);
        var ip = mockLinodes[0].ipv4[0];
        cy.get(linodeLocators.listOfLinodesTableHeader.labelSortButton)
            .should('be.visible')
            .within(function () {
            cy.findByText('Label').should('be.visible');
        });
        cy.get(linodeLocators.listOfLinodesTableHeader.statusPrioritySortButton)
            .should('be.visible')
            .within(function () {
            cy.findByText('Status').should('be.visible');
        });
        cy.get(linodeLocators.listOfLinodesTableHeader.typeSortButton)
            .should('be.visible')
            .within(function () {
            cy.findByText('Plan').should('be.visible');
        });
        cy.get(linodeLocators.listOfLinodesTableHeader.ipv4SortButton)
            .should('be.visible')
            .within(function () {
            cy.findByText('Public IP Address').should('be.visible');
        });
        cy.get(linodeLocators.listOfLinodesTableBody.rowByLabel(label))
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle(ip)
                .should('be.visible')
                .realHover()
                .then(function () {
                cy.get(linodeLocators.listOfLinodesTableBody.ipClipboardCopyButton(ip)).should('be.visible');
            });
            cy.get(linodeLocators.listOfLinodesTableBody.linodeActionMenu(label)).should('be.visible');
        });
    });
    it('checks the action menu items', function () {
        var label = linodeLabel(1);
        var menuItems = [
            'Power Off',
            'Reboot',
            'Launch LISH Console',
            'Clone',
            'Resize',
            'Rebuild',
            'Rescue',
            'Migrate',
            'Delete',
        ];
        ui_1.ui.actionMenu
            .findByTitle("Action menu for Linode ".concat(label))
            .should('be.visible')
            .click();
        menuItems.forEach(function (menuItem) {
            ui_1.ui.actionMenuItem.findByTitle(menuItem).should('be.visible');
        });
    });
    it('checks group by tag for linde table', function () {
        (0, linodes_2.mockGetLinodes)(mockLinodes).as('getLinodes');
        cy.visitWithLogin('/linodes');
        cy.wait('@getLinodes');
        // Check 'Group by Tag' button works as expected that can be visible, enabled and clickable
        cy.get(linodeLocators.listOfLinodesTableHeader.toggleGroupByTagButton)
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.get(linodeLocators.listOfLinodesTableTagsBody.evenTag).should('be.visible');
        cy.get(linodeLocators.listOfLinodesTableTagsBody.evenTag).within(function () {
            mockLinodes.forEach(function (linode) {
                if (linode.tags.includes('even')) {
                    cy.findByText(linode.label).should('be.visible');
                }
                else {
                    cy.findByText(linode.label).should('not.exist');
                }
            });
        });
        cy.get(linodeLocators.listOfLinodesTableTagsBody.oddTag).should('be.visible');
        cy.get(linodeLocators.listOfLinodesTableTagsBody.oddTag).within(function () {
            mockLinodes.forEach(function (linode) {
                if (linode.tags.includes('odd')) {
                    cy.findByText(linode.label).should('be.visible');
                }
                else {
                    cy.findByText(linode.label).should('not.exist');
                }
            });
        });
        cy.get(linodeLocators.listOfLinodesTableTagsBody.numTag).should('be.visible');
        cy.get(linodeLocators.listOfLinodesTableTagsBody.numTag).within(function () {
            mockLinodes.forEach(function (linode) {
                cy.findByText(linode.label).should('be.visible');
            });
        });
        // The linode landing table will resume when ungroup the tag.
        cy.get(linodeLocators.listOfLinodesTableHeader.toggleGroupByTagButton)
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.get(linodeLocators.listOfLinodesTableTagsBody.evenTag).should('not.exist');
        cy.get(linodeLocators.listOfLinodesTableTagsBody.oddTag).should('not.exist');
        cy.get(linodeLocators.listOfLinodesTableTagsBody.numTag).should('not.exist');
        mockLinodes.forEach(function (linode) {
            cy.findByText(linode.label).should('be.visible');
        });
    });
    it('checks summary view for linode table', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeInterfaces: { enabled: false },
        });
        var mockPreferencesListView = factories_1.userPreferencesFactory.build();
        var mockPreferencesSummaryView = __assign(__assign({}, mockPreferencesListView), { linodes_view_style: 'grid' });
        (0, linodes_2.mockGetLinodes)(mockLinodes).as('getLinodes');
        (0, profile_1.mockGetUserPreferences)(mockPreferencesListView).as('getUserPreferences');
        (0, profile_1.mockUpdateUserPreferences)(mockPreferencesSummaryView).as('updateUserPreferences');
        mockLinodes.forEach(function (linode) {
            (0, linodes_2.mockGetLinodeFirewalls)(linode.id, []);
        });
        cy.visitWithLogin('/linodes');
        cy.wait(['@getLinodes', '@getUserPreferences']);
        // Check 'Summary View' button works as expected that can be visiable, enabled and clickable
        cy.get(linodeLocators.listOfLinodesTableHeader.toggleDisplayButton)
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@updateUserPreferences');
        mockLinodes.forEach(function (linode) {
            cy.findByText(linode.label)
                .should('be.visible')
                .closest('[data-qa-linode-card]')
                .within(function () {
                cy.findByText('Summary').should('be.visible');
                cy.findByText('Public IP Addresses').should('be.visible');
                cy.findByText('Access').should('be.visible');
                cy.findByText('Plan:').should('be.visible');
                cy.findByText('Region:').should('be.visible');
                cy.findByText('Linode ID:').should('be.visible');
                cy.findByText('Created:').should('be.visible');
            });
        });
        // Toggle the 'List View' button to check the display of table items are back to the original view.
        cy.get(linodeLocators.listOfLinodesTableHeader.toggleDisplayButton)
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.findByText('Summary').should('not.exist');
        cy.findByText('Public IP Addresses').should('not.exist');
        cy.findByText('Access').should('not.exist');
        cy.findByText('Plan:').should('not.exist');
        cy.findByText('Region:').should('not.exist');
        cy.findByText('Linode ID:').should('not.exist');
        cy.findByText('Created:').should('not.exist');
    });
});
describe('linode landing checks for empty state', function () {
    beforeEach(function () {
        // Mock setup to display the Linode landing page in an empty state
        (0, linodes_2.mockGetLinodes)([]).as('getLinodes');
    });
    it('checks empty state on linode landing page', function () {
        // Login and wait for application to load
        cy.visitWithLogin(constants_1.routes.linodeLanding);
        cy.wait('@getLinodes');
        cy.url().should('endWith', constants_1.routes.linodeLanding);
        // Aliases created for accessing child elements during assertions
        cy.get(linodeLocators.emptyLinodePage.resourcesContainer).as('resourcesSection');
        cy.get('@resourcesSection')
            .get(linodeLocators.emptyLinodePage.resourcesHeader1)
            .contains('Linodes')
            .as('linodesHeader');
        // Assert that fields with Linodes and Cloud-based virtual machines text are visible
        cy.get('@linodesHeader').should('be.visible');
        cy.get('@linodesHeader')
            .next('h2')
            .should('be.visible')
            .should('have.text', 'Cloud-based virtual machines');
        //Assert that recommended section is visible - Getting Started Guides, Deploy an App and Video Playlist
        cy.get('@resourcesSection')
            .contains('h2', 'Getting Started Guides')
            .should('be.visible');
        cy.get('@resourcesSection')
            .contains('h2', 'Deploy an App')
            .should('be.visible');
        cy.get('@resourcesSection')
            .contains('h2', 'Video Playlist')
            .should('be.visible');
        // Assert that Create Linode button is visible and enabled
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .and('be.enabled');
        // Assert that List of Liondes table does not exist
        cy.get(linodeLocators.nonEmptyLinodePage.listOfLinodesTable).should('not.exist');
        // Assert that Docs link does not exist
        cy.get(linodeLocators.nonEmptyLinodePage.docsLink).should('not.exist');
        // Assert that Download CSV button does not exist
        cy.get('button').contains('Download CSV').should('not.exist');
    });
    it('checks restricted user has no access to create linode on linode landing page', function () {
        // Mock setup for user profile, account user, and user grants with restricted permissions,
        // simulating a default user without the ability to add Linodes.
        var mockProfile = factories_1.profileFactory.build({
            username: (0, random_1.randomLabel)(),
            restricted: true,
        });
        var mockUser = accountUsers_1.accountUserFactory.build({
            username: mockProfile.username,
            restricted: true,
            user_type: 'default',
        });
        var mockGrants = grants_1.grantsFactory.build({
            global: {
                add_linodes: false,
            },
        });
        (0, profile_1.mockGetProfile)(mockProfile);
        (0, profile_1.mockGetProfileGrants)(mockGrants);
        (0, account_1.mockGetUser)(mockUser);
        // Login and wait for application to load
        cy.visitWithLogin(constants_1.routes.linodeLanding);
        cy.wait('@getLinodes');
        cy.url().should('endWith', constants_1.routes.linodeLanding);
        // Assert that Create Linode button is visible and disabled
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .and('be.disabled')
            .trigger('mouseover');
        // Assert that tooltip is visible with message
        ui_1.ui.tooltip
            .findByText("You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions.")
            .should('be.visible');
    });
});
describe('linode landing checks for non-empty state with restricted user', function () {
    beforeEach(function () {
        // Mock setup to display the Linode landing page in an non-empty state
        var mockLinodes = new Array(1).fill(null).map(function (_item, index) {
            return linodes_1.linodeFactory.build({
                label: "Linode ".concat(index),
                region: (0, regions_1.chooseRegion)().id,
                tags: [index % 2 == 0 ? 'even' : 'odd', 'nums'],
            });
        });
        (0, linodes_2.mockGetLinodes)(mockLinodes).as('getLinodes');
        // Alias the mockLinodes array
        cy.wrap(mockLinodes).as('mockLinodes');
    });
    it('checks restricted user with read access has no access to create linode and can see existing linodes', function () {
        // Mock setup for user profile, account user, and user grants with restricted permissions,
        // simulating a default user without the ability to add Linodes.
        var mockProfile = factories_1.profileFactory.build({
            username: (0, random_1.randomLabel)(),
            restricted: true,
        });
        var mockGrants = grants_1.grantsFactory.build({
            global: {
                add_linodes: false,
            },
        });
        (0, profile_1.mockGetProfile)(mockProfile);
        (0, profile_1.mockGetProfileGrants)(mockGrants);
        // Intercept and alias the mock requests
        cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile'), function (req) {
            req.reply(mockProfile);
        }).as('getProfile');
        cy.intercept('GET', (0, intercepts_1.apiMatcher)('profile/grants'), function (req) {
            req.reply(mockGrants);
        }).as('getProfileGrants');
        // Login and wait for application to load
        cy.visitWithLogin(constants_1.routes.linodeLanding);
        cy.wait('@getLinodes');
        cy.url().should('endWith', constants_1.routes.linodeLanding);
        // Wait for the mock requests to complete
        cy.wait('@getProfile');
        cy.wait('@getProfileGrants');
        // Assert that Create Linode button is visible and disabled
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .and('be.disabled')
            .trigger('mouseover');
        // Assert that Download CSV button does exist
        cy.get('button').contains('Download CSV').should('exist');
        // Assert that tooltip is visible with message
        ui_1.ui.tooltip
            .findByText("You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions.")
            .should('be.visible');
        // Assert that List of Liondes table exist
        cy.get(linodeLocators.nonEmptyLinodePage.listOfLinodesTable).should('exist');
        // Assert that Docs link exist
        cy.get(linodeLocators.nonEmptyLinodePage.docsLink).should('exist');
        // Assert that the correct number of Linode entries are present in the table
        cy.get('@mockLinodes').then(function (mockLinodes) {
            // Assert that the correct number of Linode entries are present in the table
            cy.get(linodeLocators.listOfLinodesTableBody.rows).should('have.length', mockLinodes.length);
            // Assert that each Linode entry is present in the table
            mockLinodes.forEach(function (linode) {
                cy.get(linodeLocators.listOfLinodesTableBody.rows).should('contain', linode.label);
            });
        });
    });
});
