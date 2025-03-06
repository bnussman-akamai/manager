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
var luxon_1 = require("luxon");
var factories_1 = require("src/factories");
var authentication_1 = require("support/api/authentication");
var longview_1 = require("support/constants/longview");
var longview_2 = require("support/intercepts/longview");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var random_1 = require("support/util/random");
/**
 * Returns the command used to install Longview which is shown in Cloud's UI.
 *
 * @param installCode - Longview client install code.
 *
 * @returns Install command string.
 */
var getInstallCommand = function (installCode) {
    return "curl -s https://lv.linode.com/".concat(installCode, " | sudo bash");
};
/**
 * Waits for Cloud Manager to fetch Longview data and receive updates.
 *
 * Cloud Manager makes repeated requests to the `/fetch` endpoint, and this
 * function waits until one of these requests receives a response for the
 * desired Longview client indicating that its data has been updated.
 *
 * @param alias - Alias assigned to the initial HTTP intercept.
 * @param apiKey - API key for Longview client.
 */
var waitForLongviewData = function (alias, apiKey, attempt) {
    if (attempt === void 0) { attempt = 0; }
    var maxAttempts = 50;
    // Escape route in case expected response is never received.
    if (attempt > maxAttempts) {
        throw new Error("Timed out waiting for Longview client update after ".concat(maxAttempts, " attempts"));
    }
    cy.wait("@".concat(alias), { timeout: longview_1.longviewStatusTimeout }).then(function (interceptedRequest) {
        var _a, _b, _c, _d, _e;
        var responseBody = (_b = (_a = interceptedRequest.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b[0];
        var apiKeyMatches = ((_d = (_c = interceptedRequest === null || interceptedRequest === void 0 ? void 0 : interceptedRequest.request) === null || _c === void 0 ? void 0 : _c.body) !== null && _d !== void 0 ? _d : '').includes(apiKey);
        var containsUpdate = (responseBody === null || responseBody === void 0 ? void 0 : responseBody.ACTION) === 'lastUpdated' &&
            ((_e = responseBody === null || responseBody === void 0 ? void 0 : responseBody.DATA) === null || _e === void 0 ? void 0 : _e.updated) !== 0;
        if (!(apiKeyMatches && containsUpdate)) {
            (0, longview_2.interceptFetchLongviewStatus)().as(alias);
            waitForLongviewData(alias, apiKey, attempt + 1);
        }
    });
};
/*
 * Mocks that represent the state of Longview while waiting for client to be installed.
 */
var longviewLastUpdatedWaiting = factories_1.longviewResponseFactory.build({
    ACTION: 'lastUpdated',
    DATA: { updated: 0 },
    NOTIFICATIONS: [],
    VERSION: 0.4,
});
var longviewGetValuesWaiting = factories_1.longviewResponseFactory.build({
    ACTION: 'getValues',
    DATA: {},
    NOTIFICATIONS: [],
    VERSION: 0.4,
});
var longviewGetLatestValueWaiting = factories_1.longviewResponseFactory.build({
    ACTION: 'getLatestValue',
    DATA: {},
    NOTIFICATIONS: [],
    VERSION: 0.4,
});
/*
 * Mocks that represent the state of Longview once client is installed and data is received.
 */
var longviewLastUpdatedInstalled = factories_1.longviewResponseFactory.build({
    ACTION: 'lastUpdated',
    DATA: {
        updated: luxon_1.DateTime.now().plus({ minutes: 1 }).toSeconds(),
    },
    NOTIFICATIONS: [],
    VERSION: 0.4,
});
var longviewGetValuesInstalled = factories_1.longviewResponseFactory.build({
    ACTION: 'getValues',
    DATA: {
        Packages: factories_1.longviewPackageFactory.buildList(5),
    },
    NOTIFICATIONS: [],
    VERSION: 0.4,
});
var longviewGetLatestValueInstalled = factories_1.longviewResponseFactory.build({
    ACTION: 'getLatestValue',
    DATA: factories_1.longviewLatestStatsFactory.build(),
    NOTIFICATIONS: [],
    VERSION: 0.4,
});
(0, authentication_1.authenticate)();
describe('longview', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes', 'longview-clients']);
    });
    /*
     * - Tests Longview installation end-to-end using mock API data.
     * - Confirms that Cloud Manager UI updates to reflect Longview installation and data.
     */
    it('can install Longview client on a Linode', function () {
        var client = factories_1.longviewClientFactory.build({
            api_key: '01AE82DD-6F99-44F6-95781512B64FFBC3',
            apps: factories_1.longviewAppsFactory.build(),
            created: new Date().toISOString(),
            id: 338283,
            install_code: '748632FC-E92B-491F-A29D44019039017C',
            label: 'longview-client-longview338283',
            updated: new Date().toISOString(),
        });
        (0, longview_2.mockGetLongviewClients)([client]).as('getLongviewClients');
        (0, longview_2.mockFetchLongviewStatus)(client, 'lastUpdated', longviewLastUpdatedWaiting);
        (0, longview_2.mockFetchLongviewStatus)(client, 'getValues', longviewGetValuesWaiting);
        (0, longview_2.mockFetchLongviewStatus)(client, 'getLatestValue', longviewGetLatestValueWaiting).as('fetchLongview');
        var installCommand = getInstallCommand(client.install_code);
        cy.visitWithLogin('/longview');
        cy.wait('@getLongviewClients');
        // Confirm that Longview landing page lists a client that is still waiting for data...
        cy.get("[data-qa-longview-client=\"".concat(client.id, "\"]"))
            .should('be.visible')
            .within(function () {
            cy.findByText(client.label).should('be.visible');
            cy.findByText(client.api_key).should('be.visible');
            cy.contains(installCommand).should('be.visible');
            cy.findByText('Waiting for data...');
        });
        // Update mocks after initial Longview fetch to simulate client installation and data retrieval.
        // The next time Cloud makes a request to the fetch endpoint, data will start being returned.
        // 3 fetches is necessary because the Longview landing page fires 3 requests to the Longview fetch endpoint for each client.
        // See https://github.com/linode/manager/pull/10579#discussion_r1647945160
        cy.wait(['@fetchLongview', '@fetchLongview', '@fetchLongview']).then(function () {
            (0, longview_2.mockFetchLongviewStatus)(client, 'lastUpdated', longviewLastUpdatedInstalled);
            (0, longview_2.mockFetchLongviewStatus)(client, 'getValues', longviewGetValuesInstalled);
            (0, longview_2.mockFetchLongviewStatus)(client, 'getLatestValue', longviewGetLatestValueInstalled);
        });
        // Confirms that UI updates to show that data has been retrieved.
        cy.findByText("".concat(client.label)).should('be.visible');
        cy.get("[data-qa-longview-client=\"".concat(client.id, "\"]"))
            .should('be.visible')
            .within(function () {
            cy.findByText('Waiting for data...').should('not.exist');
            cy.findByText('CPU').should('be.visible');
            cy.findByText('RAM').should('be.visible');
            cy.findByText('Swap').should('be.visible');
            cy.findByText('Load').should('be.visible');
            cy.findByText('Network').should('be.visible');
            cy.findByText('Storage').should('be.visible');
        });
    });
    /*
     * - Confirms that the landing page empty state message is displayed when no Longview clients are present.
     * - Confirms that UI updates to show the new client when creating one.
     */
    it('displays empty state message when no clients are present and shows the new client when creating one', function () {
        var client = factories_1.longviewClientFactory.build();
        (0, longview_2.mockGetLongviewClients)([]).as('getLongviewClients');
        (0, longview_2.mockCreateLongviewClient)(client).as('createLongviewClient');
        (0, longview_2.mockFetchLongviewStatus)(client, 'lastUpdated', longviewLastUpdatedWaiting);
        (0, longview_2.mockFetchLongviewStatus)(client, 'getValues', longviewGetValuesWaiting);
        (0, longview_2.mockFetchLongviewStatus)(client, 'getLatestValue', longviewGetLatestValueWaiting).as('fetchLongview');
        cy.visitWithLogin('/longview');
        cy.wait('@getLongviewClients');
        // Confirms that a landing page empty state message is displayed
        cy.findByText(longview_1.longviewEmptyStateMessage).should('be.visible');
        cy.findByText(longview_1.longviewAddClientButtonText).should('be.visible');
        ui_1.ui.button
            .findByTitle(longview_1.longviewAddClientButtonText)
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLongviewClient');
        // Update mocks after initial Longview fetch to simulate client installation and data retrieval.
        // The next time Cloud makes a request to the fetch endpoint, data will start being returned.
        // 3 fetches is necessary because the Longview landing page fires 3 requests to the Longview fetch endpoint for each client.
        // See https://github.com/linode/manager/pull/10579#discussion_r1647945160
        cy.wait(['@fetchLongview', '@fetchLongview', '@fetchLongview']).then(function () {
            (0, longview_2.mockFetchLongviewStatus)(client, 'lastUpdated', longviewLastUpdatedInstalled);
            (0, longview_2.mockFetchLongviewStatus)(client, 'getValues', longviewGetValuesInstalled);
            (0, longview_2.mockFetchLongviewStatus)(client, 'getLatestValue', longviewGetLatestValueInstalled);
        });
        // Confirms that UI updates to show the new client when creating one.
        cy.findByText("".concat(client.label)).should('be.visible');
        cy.get("[data-qa-longview-client=\"".concat(client.id, "\"]"))
            .should('be.visible')
            .within(function () {
            cy.findByText('Waiting for data...').should('not.exist');
            cy.findByText('CPU').should('be.visible');
            cy.findByText('RAM').should('be.visible');
            cy.findByText('Swap').should('be.visible');
            cy.findByText('Load').should('be.visible');
            cy.findByText('Network').should('be.visible');
            cy.findByText('Storage').should('be.visible');
        });
    });
    /*
     * - Tests Longview installation end-to-end using mock API data.
     * - Confirms that Cloud Manager UI can rename longview client.
     */
    it('can rename a Longview client on a Linode', function () {
        var client = factories_1.longviewClientFactory.build();
        var newClient = factories_1.longviewClientFactory.build(__assign(__assign({}, client), { label: (0, random_1.randomLabel)() }));
        (0, longview_2.mockGetLongviewClients)([client]).as('getLongviewClients');
        (0, longview_2.mockFetchLongviewStatus)(client, 'lastUpdated', longviewLastUpdatedWaiting);
        (0, longview_2.mockFetchLongviewStatus)(client, 'getValues', longviewGetValuesWaiting);
        (0, longview_2.mockFetchLongviewStatus)(client, 'getLatestValue', longviewGetLatestValueWaiting).as('fetchLongview');
        cy.visitWithLogin('/longview');
        cy.wait('@getLongviewClients');
        // Update mocks after initial Longview fetch to simulate client installation and data retrieval.
        // The next time Cloud makes a request to the fetch endpoint, data will start being returned.
        // 3 fetches is necessary because the Longview landing page fires 3 requests to the Longview fetch endpoint for each client.
        // See https://github.com/linode/manager/pull/10579#discussion_r1647945160
        cy.wait(['@fetchLongview', '@fetchLongview', '@fetchLongview']).then(function () {
            (0, longview_2.mockFetchLongviewStatus)(client, 'lastUpdated', longviewLastUpdatedInstalled);
            (0, longview_2.mockFetchLongviewStatus)(client, 'getValues', longviewGetValuesInstalled);
            (0, longview_2.mockFetchLongviewStatus)(client, 'getLatestValue', longviewGetLatestValueInstalled);
        });
        (0, longview_2.mockUpdateLongviewClient)(newClient.id, newClient).as('updateLongview');
        // Confirms that Cloud Manager UI can rename longview client.
        cy.get("[data-testid=\"editable-text\"] > [data-testid=\"button\"]")
            .should('be.visible')
            .click();
        cy.get("[data-qa-longview-client=\"".concat(client.id, "\"]")).within(function () {
            cy.get("[data-testid=\"textfield-input\"]").clear();
            cy.focused().type(newClient.label);
            cy.get("[aria-label=\"Save new label\"]").should('be.visible').click();
        });
        cy.wait('@updateLongview');
        cy.findAllByText(newClient.label).should('be.visible');
    });
    /*
     * - Tests Longview installation end-to-end using mock API data.
     * - Confirms that Cloud Manager UI can delete longview client.
     */
    it('can delete a Longview client on a Linode', function () {
        var client = factories_1.longviewClientFactory.build();
        var deleteWarnMessage = 'Are you sure you want to delete this Longview Client?';
        (0, longview_2.mockGetLongviewClients)([client]).as('getLongviewClients');
        (0, longview_2.mockFetchLongviewStatus)(client, 'lastUpdated', longviewLastUpdatedWaiting);
        (0, longview_2.mockFetchLongviewStatus)(client, 'getValues', longviewGetValuesWaiting);
        (0, longview_2.mockFetchLongviewStatus)(client, 'getLatestValue', longviewGetLatestValueWaiting).as('fetchLongview');
        cy.visitWithLogin('/longview');
        cy.wait('@getLongviewClients');
        // Update mocks after initial Longview fetch to simulate client installation and data retrieval.
        // The next time Cloud makes a request to the fetch endpoint, data will start being returned.
        // 3 fetches is necessary because the Longview landing page fires 3 requests to the Longview fetch endpoint for each client.
        // See https://github.com/linode/manager/pull/10579#discussion_r1647945160
        cy.wait(['@fetchLongview', '@fetchLongview', '@fetchLongview']).then(function () {
            (0, longview_2.mockFetchLongviewStatus)(client, 'lastUpdated', longviewLastUpdatedInstalled);
            (0, longview_2.mockFetchLongviewStatus)(client, 'getValues', longviewGetValuesInstalled);
            (0, longview_2.mockFetchLongviewStatus)(client, 'getLatestValue', longviewGetLatestValueInstalled);
        });
        (0, longview_2.mockDeleteLongviewClient)(client.id).as('deleteLongview');
        // Confirms that Cloud Manager UI has delete option.
        cy.get("[data-qa-longview-client=\"".concat(client.id, "\"]")).within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Longview Client ".concat(client.label))
                .should('be.visible')
                .click();
        });
        ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
        // Confirms that Cloud Manager UI has delete warning message and can cancel deletion.
        ui_1.ui.dialog
            .findByTitle("Delete ".concat(client.label, "?"))
            .should('be.visible')
            .within(function () {
            cy.findByText(deleteWarnMessage).should('be.visible');
            ui_1.ui.buttonGroup.findButtonByTitle('Cancel').should('be.visible').click();
        });
        // Confirms that Cloud Manager UI can delete a Longview Client.
        cy.get("[data-qa-longview-client=\"".concat(client.id, "\"]")).within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Longview Client ".concat(client.label))
                .click();
        });
        ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
        ui_1.ui.dialog.findByTitle("Delete ".concat(client.label, "?")).within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that Longview Client is deleted.
        cy.wait('@deleteLongview');
        cy.findByText(client.label).should('not.exist');
    });
});
