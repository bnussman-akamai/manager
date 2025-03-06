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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var linodes_1 = require("support/util/linodes");
var ui_1 = require("support/ui");
var authentication_1 = require("support/api/authentication");
var cleanup_1 = require("support/util/cleanup");
var vpc_1 = require("support/intercepts/vpc");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var linodes_2 = require("support/constants/linodes");
var regions_1 = require("support/util/regions");
var vlans_1 = require("support/intercepts/vlans");
var linodes_3 = require("support/intercepts/linodes");
var configs_1 = require("support/intercepts/configs");
var linodes_4 = require("support/util/linodes");
var factories_1 = require("@src/factories");
var random_1 = require("support/util/random");
var kernels_1 = require("support/util/kernels");
var constants_1 = require("src/features/VPCs/constants");
/**
 * Returns a Promise that resolves to a new test Linode and its first config object.
 *
 * @param interfaces - Interfaces with which to create test Linode.
 *
 * @throws If created Linode does not have any configs.
 */
var createLinodeAndGetConfig = function (payload, options) { return __awaiter(void 0, void 0, void 0, function () {
    var linode, config;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, linodes_1.createTestLinode)(payload, options)];
            case 1:
                linode = _a.sent();
                return [4 /*yield*/, (0, linodes_4.fetchLinodeConfigs)(linode.id)];
            case 2:
                config = (_a.sent())[0];
                if (!config) {
                    throw new Error("Linode '".concat(linode.label, "' (ID ").concat(linode.id, ") does not have any configs"));
                }
                return [2 /*return*/, [linode, config]];
        }
    });
}); };
var kernels = [];
(0, authentication_1.authenticate)();
describe('Linode Config management', function () {
    describe('End-to-End', function () {
        before(function () {
            (0, cleanup_1.cleanUp)('linodes');
            // Fetch Linode kernel data from the API.
            // We'll use this data in the tests to confirm that config labels are rendered correctly.
            cy.defer(function () { return (0, kernels_1.fetchAllKernels)(); }, 'Fetching Linode kernels...').then(function (fetchedKernels) {
                kernels = fetchedKernels;
            });
        });
        beforeEach(function () {
            cy.tag('method:e2e');
        });
        /*
         * - Tests Linode config creation end-to-end using real API requests.
         * - Confirms that a config is listed after a Linode has been created.
         * - Confirms that config creation can be initiated and completed successfully.
         * - Confirms that new config is automatically listed after being created.
         */
        it('Creates a config', function () {
            // Wait for Linode to be created for kernel data to be retrieved.
            cy.defer(function () { return (0, linodes_1.createTestLinode)(); }, 'Creating Linode').then(function (linode) {
                (0, configs_1.interceptCreateLinodeConfigs)(linode.id).as('postLinodeConfigs');
                (0, configs_1.interceptGetLinodeConfigs)(linode.id).as('getLinodeConfigs');
                cy.visitWithLogin("/linodes/".concat(linode.id, "/configurations"));
                // Confirm that initial config is listed in Linode configurations table.
                cy.wait('@getLinodeConfigs');
                cy.defer(function () { return (0, linodes_4.fetchLinodeConfigs)(linode.id); }).then(function (configs) {
                    cy.findByLabelText('List of Configurations').within(function () {
                        configs.forEach(function (config) {
                            var kernel = (0, kernels_1.findKernelById)(kernels, config.kernel);
                            cy.findByText("".concat(config.label, " \u2013 ").concat(kernel.label)).should('be.visible');
                        });
                    });
                });
                // Add new configuration.
                cy.findByText('Add Configuration').click();
                ui_1.ui.dialog
                    .findByTitle('Add Configuration')
                    .should('be.visible')
                    .within(function () {
                    cy.get('#label').type("".concat(linode.id, "-test-config"));
                    ui_1.ui.buttonGroup
                        .findButtonByTitle('Add Configuration')
                        .scrollIntoView()
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
                // Confirm that config creation request was successful.
                cy.wait('@postLinodeConfigs')
                    .its('response.statusCode')
                    .should('eq', 200);
                // Confirm that new config and existing config are both listed.
                cy.wait('@getLinodeConfigs');
                cy.defer(function () { return (0, linodes_4.fetchLinodeConfigs)(linode.id); }).then(function (configs) {
                    cy.findByLabelText('List of Configurations').within(function () {
                        configs.forEach(function (config) {
                            var kernel = (0, kernels_1.findKernelById)(kernels, config.kernel);
                            cy.findByText("".concat(config.label, " \u2013 ").concat(kernel.label))
                                .should('be.visible')
                                .closest('tr')
                                .within(function () {
                                cy.findByText('eth0 – Public Internet').should('be.visible');
                            });
                        });
                    });
                });
            });
        });
        /**
         * - Tests Linode config edit flow end-to-end using real API requests.
         * - Confirms that an existing config can be edited.
         * - Confirms that updated config data is automatically displayed after editing.
         */
        it('Edits a config', function () {
            // Config interfaces to use when creating test Linode.
            var interfaces = [
                {
                    ipam_address: '',
                    label: '',
                    purpose: 'public',
                },
                {
                    ipam_address: '',
                    label: 'testvlan',
                    purpose: 'vlan',
                },
            ];
            // Create a Linode and wait for its Config to be fetched before proceeding.
            cy.defer(function () { return createLinodeAndGetConfig({ interfaces: interfaces }, { waitForDisks: true }); }, 'creating a linode and getting its config').then(function (_a) {
                var linode = _a[0], config = _a[1];
                // Get kernel info for config.
                var kernel = (0, kernels_1.findKernelById)(kernels, config.kernel);
                var newIpamAddress = '192.0.2.0/25';
                cy.visitWithLogin("/linodes/".concat(linode.id, "/configurations"));
                (0, configs_1.interceptUpdateLinodeConfigs)(linode.id, config.id).as('putLinodeConfigs');
                // Confirm that config is listed as expected, then click "Edit".
                cy.contains("".concat(config.label, " \u2013 ").concat(kernel.label)).should('be.visible');
                cy.findByText('Edit').click();
                // Enter a new IPAM address for eth1 (VLAN), then click "Save Changes"
                ui_1.ui.dialog
                    .findByTitle('Edit Configuration')
                    .should('be.visible')
                    .within(function () {
                    cy.get('#ipam-input-1').type(newIpamAddress);
                    ui_1.ui.button
                        .findByTitle('Save Changes')
                        .scrollIntoView()
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
                // Confirm that config update request succeeded and that toast appears.
                cy.wait('@putLinodeConfigs')
                    .its('response.statusCode')
                    .should('eq', 200);
                ui_1.ui.toast.assertMessage("Configuration ".concat(config.label, " successfully updated"), { timeout: linodes_2.LINODE_CLONE_TIMEOUT });
                // Confirm that updated IPAM is automatically listed in config table.
                cy.findByLabelText('List of Configurations').within(function () {
                    var configKernel = (0, kernels_1.findKernelById)(kernels, config.kernel);
                    cy.findByText("".concat(config.label, " \u2013 ").concat(configKernel.label))
                        .should('be.visible')
                        .closest('tr')
                        .within(function () {
                        cy.contains('eth0 – Public Internet').should('be.visible');
                        cy.contains("eth1 \u2013 VLAN: testvlan (".concat(newIpamAddress, ")")).should('be.visible');
                    });
                });
            });
        });
        /*
         * - Confirms Linode config boot flow end-to-end using real API requests.
         * - Confirms that API reboot request succeeds and Cloud UI automatically updates to reflect reboot.
         */
        it('Boots a config', function () {
            cy.defer(function () {
                return createLinodeAndGetConfig({ booted: true }, { waitForBoot: true, securityMethod: 'vlan_no_internet' });
            }, 'Creating and booting test Linode').then(function (_a) {
                var linode = _a[0], config = _a[1];
                var kernel = (0, kernels_1.findKernelById)(kernels, config.kernel);
                cy.visitWithLogin("/linodes/".concat(linode.id, "/configurations"));
                (0, linodes_3.interceptRebootLinode)(linode.id).as('rebootLinode');
                // Confirm that Linode config is listed, then click its "Boot" button.
                cy.findByText("".concat(config.label, " \u2013 ").concat(kernel.label))
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.findByText('Boot').click();
                });
                // Proceed through boot confirmation dialog.
                ui_1.ui.dialog
                    .findByTitle('Confirm Boot')
                    .should('be.visible')
                    .within(function () {
                    cy.contains("Are you sure you want to boot \"".concat(config.label, "\"?")).should('be.visible');
                    ui_1.ui.button
                        .findByTitle('Boot')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
                // Confirm that API request succeeds, toast appears, and UI updates to reflect reboot.
                cy.wait('@rebootLinode').its('response.statusCode').should('eq', 200);
                ui_1.ui.toast.assertMessage("Successfully booted config ".concat(config.label));
                cy.findByText('REBOOTING').should('be.visible');
            });
        });
        /*
         * - Confirms Linode config clone flow end-to-end using real API requests.
         * - Confirms that API config clone requests succeed.
         * - Confirms that Cloud UI automatically updates to reflect clone-in-progress.
         */
        it('Clones a config', function () {
            // Create clone source and destination Linodes.
            // Use `vlan_no_internet` security method.
            // This works around an issue where the Linode API responds with a 400
            // when attempting to interact with it shortly after booting up when the
            // Linode is attached to a Cloud Firewall.
            var createCloneTestLinodes = function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, Promise.all([
                            (0, linodes_1.createTestLinode)({ booted: true }, { securityMethod: 'vlan_no_internet', waitForBoot: true }),
                            (0, linodes_1.createTestLinode)({ booted: true }, { securityMethod: 'vlan_no_internet' }),
                        ])];
                });
            }); };
            // Create clone and source destination Linodes, then proceed with clone flow.
            cy.defer(function () { return createCloneTestLinodes(); }, 'Waiting for 2 Linodes to be created').then(function (_a) {
                var sourceLinode = _a[0], destLinode = _a[1];
                var kernel = (0, kernels_1.findKernelById)(kernels, 'linode/latest-64bit');
                var sharedConfigLabel = 'cy-test-sharable-config';
                cy.visitWithLogin("/linodes/".concat(sourceLinode.id, "/configurations"));
                // Add a new configuration that we can share across our Linodes.
                ui_1.ui.button
                    .findByTitle('Add Configuration')
                    .should('be.enabled')
                    .should('be.visible')
                    .click();
                ui_1.ui.dialog
                    .findByTitle('Add Configuration')
                    .should('be.visible')
                    .within(function () {
                    cy.findByLabelText('Label', { exact: false })
                        .should('be.visible')
                        .type(sharedConfigLabel);
                    cy.findByText('Select a Kernel')
                        .as('qaSelectKernel')
                        .scrollIntoView();
                    cy.get('@qaSelectKernel').click();
                    cy.focused().type('Latest 64 bit{enter}');
                    ui_1.ui.buttonGroup
                        .findButtonByTitle('Add Configuration')
                        .scrollIntoView()
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
                // Confirm that new configuration is listed in table.
                cy.findByLabelText('List of Configurations').within(function () {
                    cy.findByText("".concat(sharedConfigLabel, " \u2013 ").concat(kernel.label))
                        .should('be.visible')
                        .closest('tr')
                        .within(function () {
                        cy.findByText('eth0 – Public Internet').should('be.visible');
                    });
                });
                // Initiate configuration clone flow.
                ui_1.ui.actionMenu
                    .findByTitle("Action menu for Linode Config ".concat(sharedConfigLabel))
                    .should('be.visible')
                    .click();
                ui_1.ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();
                cy.findByTestId('config-clone-selection-details')
                    .should('be.visible')
                    .within(function () {
                    ui_1.ui.button.findByTitle('Clone').should('be.disabled');
                    cy.findByLabelText('Linode').should('be.visible').click();
                    ui_1.ui.autocomplete.find().should('be.visible');
                    ui_1.ui.autocompletePopper
                        .findByTitle(destLinode.label)
                        .should('be.visible')
                        .click();
                    ui_1.ui.button.findByTitle('Clone').should('be.enabled').click();
                });
                // Confirm toast message and that UI updates to reflect clone in progress.
                ui_1.ui.toast.assertMessage("Linode ".concat(sourceLinode.label, " has been cloned to ").concat(destLinode.label, "."));
                cy.findByText(/CLONING \(\d+%\)/).should('be.visible');
            });
        });
        /*
         * - Confirms Linode config delete flow end-to-end using real API requests.
         * - Confirms that config can be deleted and related API requests succeed.
         * - Confirms that Cloud Manager UI automatically updates to reflect deleted config.
         */
        it('Deletes a config', function () {
            cy.defer(function () { return createLinodeAndGetConfig(); }, 'creating a linode and getting its config').then(function (_a) {
                var linode = _a[0], config = _a[1];
                // Get kernel info for config to be deleted.
                var kernel = (0, kernels_1.findKernelById)(kernels, config.kernel);
                (0, configs_1.interceptDeleteLinodeConfig)(linode.id, config.id).as('deleteLinodeConfig');
                cy.visitWithLogin("/linodes/".concat(linode.id, "/configurations"));
                // Confirm that config is listed and initiate deletion.
                cy.findByText("".concat(config.label, " \u2013 ").concat(kernel.label)).should('be.visible');
                ui_1.ui.actionMenu
                    .findByTitle("Action menu for Linode Config ".concat(config.label))
                    .should('be.visible')
                    .click();
                ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
                // Confirm config deletion.
                ui_1.ui.dialog
                    .findByTitle('Confirm Delete')
                    .should('be.visible')
                    .within(function () {
                    ui_1.ui.button
                        .findByTitle('Delete')
                        .scrollIntoView()
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
                // Confirm request succeeds, toast appears, and config is removed from list.
                cy.wait('@deleteLinodeConfig')
                    .its('response.statusCode')
                    .should('eq', 200);
                ui_1.ui.toast.assertMessage("Configuration ".concat(config.label, " successfully deleted"));
                cy.findByLabelText('List of Configurations').within(function () {
                    cy.contains('No data to display.').should('be.visible');
                });
            });
        });
    });
    describe('Mocked', function () {
        var region = (0, regions_1.getRegionById)('us-southeast');
        var mockKernel = factories_1.kernelFactory.build();
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        // Mock config with public internet for eth0 and VLAN for eth1.
        var mockConfig = factories_1.linodeConfigFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            kernel: mockKernel.id,
            interfaces: [
                factories_1.LinodeConfigInterfaceFactory.build({
                    ipam_address: null,
                    purpose: 'public',
                    label: null,
                }),
                factories_1.LinodeConfigInterfaceFactory.build({
                    label: (0, random_1.randomLabel)(),
                    purpose: 'vlan',
                }),
            ],
        });
        var mockVLANs = factories_1.VLANFactory.buildList(2);
        /*
         * - Tests Linode config create and VPC interface assignment UI flows using mock API data.
         * - Confirms that VPC can be assigned as eth0, eth1, and eth2.
         * - Confirms public internet access/NAT helper text appears when VPC is set as eth0.
         * - Confirms that "REBOOT NEEDED" status indicator appears upon creating VPC config.
         */
        it('Creates a new config and assigns a VPC as a network interface', function () {
            var mockLinode = factories_1.linodeFactory.build({
                region: region.id,
                type: dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id,
            });
            // Mock config with VPC for eth0 and no other interfaces.
            var mockConfigWithVpc = __assign(__assign({}, mockConfig), { interfaces: [
                    factories_1.LinodeConfigInterfaceFactoryWithVPC.build({
                        vpc_id: mockVPC.id,
                        active: false,
                        label: null,
                    }),
                ] });
            // Mock a Linode with no existing configs, then visit its details page.
            (0, linodes_3.mockGetLinodeKernel)(mockKernel.id, mockKernel);
            (0, linodes_3.mockGetLinodeKernels)([mockKernel]);
            (0, linodes_3.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
            (0, linodes_3.mockGetLinodeDisks)(mockLinode.id, []).as('getDisks');
            (0, linodes_3.mockGetLinodeVolumes)(mockLinode.id, []).as('getVolumes');
            (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, []).as('getConfigs');
            (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
            (0, vlans_1.mockGetVLANs)(mockVLANs);
            cy.visitWithLogin("/linodes/".concat(mockLinode.id, "/configurations"));
            cy.wait(['@getConfigs', '@getDisks', '@getLinode', '@getVolumes']);
            // Confirm that there are no configurations displayed.
            cy.findByLabelText('List of Configurations').within(function () {
                cy.findByText('No data to display.').should('be.visible');
            });
            // Mock requests to create new config and re-fetch configs.
            (0, configs_1.mockCreateLinodeConfigs)(mockLinode.id, mockConfigWithVpc).as('createLinodeConfig');
            (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockConfigWithVpc]).as('getLinodeConfigs');
            // Create new config.
            cy.findByText('Add Configuration').click();
            ui_1.ui.dialog
                .findByTitle('Add Configuration')
                .should('be.visible')
                .within(function () {
                cy.get('#label').type("".concat(mockConfigWithVpc.label));
                // Confirm that "VPC" can be selected for either "eth0", "eth1", or "eth2".
                // Add VPC to eth0
                cy.get('[data-qa-textfield-label="eth0"]')
                    .as('qaEth')
                    .scrollIntoView();
                cy.get('@qaEth').click();
                cy.focused().type('VPC');
                ui_1.ui.autocomplete.find().should('be.visible');
                ui_1.ui.autocompletePopper.findByTitle('VPC').should('be.visible').click();
                // Confirm that internet access warning is displayed when eth0 is set
                // to VPC.
                cy.findByText(constants_1.NOT_NATTED_HELPER_TEXT).should('be.visible');
                // Confirm that VPC is an option for eth1 and eth2, but don't select them.
                ['eth1', 'eth2'].forEach(function (interfaceName) {
                    cy.get("[data-qa-textfield-label=\"".concat(interfaceName, "\"]"))
                        .as('qaInterfaceName')
                        .scrollIntoView();
                    cy.get('@qaInterfaceName').click();
                    cy.focused().type('VPC');
                    ui_1.ui.autocomplete.find().should('be.visible');
                    ui_1.ui.autocompletePopper
                        .findByTitle('VPC')
                        .should('be.visible')
                        .click();
                    cy.get("[data-qa-textfield-label=\"".concat(interfaceName, "\"]")).click();
                });
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Add Configuration')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@createLinodeConfig', '@getLinodeConfigs', '@getVPC']);
            // Confirm that VPC has been assigned to eth0, and that "REBOOT NEEDED"
            // status message is shown.
            cy.findByLabelText('List of Configurations').within(function () {
                cy.contains("".concat(mockConfig.label, " \u2013 ").concat(mockKernel.label)).should('be.visible');
                cy.contains("eth0 \u2013 VPC: ".concat(mockVPC.label)).should('be.visible');
            });
            cy.findByText('REBOOT NEEDED').should('be.visible');
        });
        /*
         * - Tests Linode config edit and VPC interface assignment UI flows using mock API data.
         * - Confirms that VPC can be assigned as eth2 in addition to existing interfaces.
         * - Confirms that "REBOOT NEEDED" status indicator appears upon creating VPC config.
         */
        it('Edits an existing config and assigns a VPC as a network interface', function () {
            var _a;
            var mockLinode = factories_1.linodeFactory.build({
                region: region.id,
                type: dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id,
            });
            // Mock config with public internet eth0, VLAN eth1, and VPC eth2.
            var mockConfigInterfaces = (_a = mockConfig.interfaces) !== null && _a !== void 0 ? _a : [];
            var mockConfigWithVpc = __assign(__assign({}, mockConfig), { interfaces: __spreadArray(__spreadArray([], mockConfigInterfaces, true), [
                    factories_1.LinodeConfigInterfaceFactoryWithVPC.build({
                        label: undefined,
                        vpc_id: mockVPC.id,
                        active: false,
                    }),
                ], false) });
            (0, linodes_3.mockGetLinodeKernel)(mockKernel.id, mockKernel);
            (0, linodes_3.mockGetLinodeKernels)([mockKernel]);
            (0, linodes_3.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
            (0, linodes_3.mockGetLinodeDisks)(mockLinode.id, []).as('getDisks');
            (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockConfig]).as('getConfig');
            (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
            (0, linodes_3.mockGetLinodeVolumes)(mockLinode.id, []).as('getVolumes');
            cy.visitWithLogin("/linodes/".concat(mockLinode.id, "/configurations"));
            cy.wait(['@getLinode', '@getConfig', '@getDisks', '@getVolumes']);
            // Find configuration in list and click its "Edit" button.
            cy.findByLabelText('List of Configurations').within(function () {
                cy.findByText("".concat(mockConfig.label, " \u2013 ").concat(mockKernel.label))
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    ui_1.ui.button.findByTitle('Edit').click();
                });
            });
            // Set up mocks for config update.
            (0, vlans_1.mockGetVLANs)(mockVLANs);
            (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
            (0, configs_1.mockUpdateLinodeConfigs)(mockLinode.id, mockConfigWithVpc).as('updateLinodeConfigs');
            (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockConfigWithVpc]).as('getLinodeConfigs');
            ui_1.ui.dialog
                .findByTitle('Edit Configuration')
                .should('be.visible')
                .within(function () {
                // Set eth2 to VPC and submit.
                cy.get('[data-qa-textfield-label="eth2"]').scrollIntoView();
                cy.get('[data-qa-textfield-label="eth2"]').click();
                cy.focused().type('VPC{enter}');
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .scrollIntoView()
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@updateLinodeConfigs', '@getLinodeConfigs', '@getVPC']);
            // Confirm that VLAN and VPC have been assigned.
            cy.findByLabelText('List of Configurations').within(function () {
                cy.contains("".concat(mockConfig.label, " \u2013 ").concat(mockKernel.label)).should('be.visible');
                cy.contains('eth0 – Public Internet').should('be.visible');
                cy.contains("eth2 \u2013 VPC: ".concat(mockVPC.label)).should('be.visible');
            });
            cy.findByText('REBOOT NEEDED').should('be.visible');
        });
        /*
         * - Tests Linode config edit and VPC interface assignment UI flows using mock API data.
         * - When the user sets primary interface to eth0, sets eth0 to "Public Internet", and sets eth1 to "VPC", confirm that correct notice appears.
         * - When the user sets primary interface to eth0, sets eth0 to "Public Internet", sets eth1 to "VPC", and checks "Assign a public IPv4 address for this Linode", confirm that correct notice appears.
         * - Confirms that "REBOOT NEEDED" status indicator appears upon creating VPC config.
         */
        it('Creates a new config using non-recommended settings and confirm the informational notices', function () {
            var region = (0, regions_1.chooseRegion)({ capabilities: ['VPCs'] });
            var mockLinode = factories_1.linodeFactory.build({
                id: (0, random_1.randomNumber)(),
                label: (0, random_1.randomLabel)(),
                region: region.id,
            });
            var mockSubnet = factories_1.subnetFactory.build({
                id: (0, random_1.randomNumber)(),
                label: (0, random_1.randomLabel)(),
                linodes: [],
                ipv4: "".concat((0, random_1.randomIp)(), "/0"),
            });
            var mockVPC = factories_1.vpcFactory.build({
                id: (0, random_1.randomNumber)(),
                label: (0, random_1.randomLabel)(),
                region: region.id,
                subnets: [mockSubnet],
            });
            // Mock config with public internet eth0, VPC eth1 and no other interfaces.
            var mockConfigWithVpc = __assign(__assign({}, mockConfig), { interfaces: [
                    factories_1.LinodeConfigInterfaceFactory.build({
                        ipam_address: null,
                        purpose: 'public',
                        label: null,
                    }),
                    factories_1.LinodeConfigInterfaceFactoryWithVPC.build({
                        vpc_id: mockVPC.id,
                        active: false,
                        label: null,
                    }),
                ] });
            // Mock a Linode with no existing configs, then visit its details page.
            (0, linodes_3.mockGetLinodeKernel)(mockKernel.id, mockKernel);
            (0, linodes_3.mockGetLinodeKernels)([mockKernel]);
            (0, linodes_3.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
            (0, linodes_3.mockGetLinodeDisks)(mockLinode.id, []).as('getDisks');
            (0, linodes_3.mockGetLinodeVolumes)(mockLinode.id, []).as('getVolumes');
            (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, []).as('getConfigs');
            (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
            (0, vpc_1.mockGetVPCs)([mockVPC]).as('getVPCs');
            cy.visitWithLogin("/linodes/".concat(mockLinode.id, "/configurations"));
            cy.wait(['@getConfigs', '@getDisks', '@getLinode', '@getVolumes']);
            // Confirm that there are no configurations displayed.
            cy.findByLabelText('List of Configurations').within(function () {
                cy.findByText('No data to display.').should('be.visible');
            });
            // Mock requests to create new config and re-fetch configs.
            (0, configs_1.mockCreateLinodeConfigs)(mockLinode.id, mockConfigWithVpc).as('createLinodeConfig');
            (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockConfigWithVpc]).as('getLinodeConfigs');
            // Create new config.
            cy.findByText('Add Configuration').click();
            ui_1.ui.dialog
                .findByTitle('Add Configuration')
                .should('be.visible')
                .within(function () {
                cy.get('#label').type("".concat(mockConfigWithVpc.label));
                // Sets eth0 to "Public Internet", and sets eth1 to "VPC"
                cy.get('[data-qa-textfield-label="eth0"]').scrollIntoView();
                cy.get('[data-qa-textfield-label="eth0"]').click();
                cy.focused().type('Public Internet');
                ui_1.ui.autocomplete.find().should('be.visible');
                ui_1.ui.autocompletePopper
                    .findByTitle('Public Internet')
                    .should('be.visible')
                    .click();
                cy.get('[data-qa-textfield-label="eth1"]').scrollIntoView();
                cy.get('[data-qa-textfield-label="eth1"]').click();
                cy.focused().type('VPC');
                ui_1.ui.autocomplete.find().should('be.visible');
                ui_1.ui.autocompletePopper.findByTitle('VPC').should('be.visible').click();
                // Confirm that internet access warning is displayed.
                cy.findByText(constants_1.LINODE_UNREACHABLE_HELPER_TEXT).should('be.visible');
                // Sets eth0 to "Public Internet", and sets eth1 to "VPC",
                // and checks "Assign a public IPv4 address for this Linode"
                cy.get('[data-qa-textfield-label="VPC"]').scrollIntoView();
                cy.get('[data-qa-textfield-label="VPC"]').click();
                cy.focused().type("".concat(mockVPC.label));
                ui_1.ui.autocomplete.find().should('be.visible');
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(mockVPC.label))
                    .should('be.visible')
                    .click();
                cy.get('[data-qa-textfield-label="Subnet"]').scrollIntoView();
                cy.get('[data-qa-textfield-label="Subnet"]').click();
                cy.focused().type("".concat(mockSubnet.label));
                ui_1.ui.autocomplete.find().should('be.visible');
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(mockSubnet.label, " (").concat(mockSubnet.ipv4, ")"))
                    .should('be.visible')
                    .click();
                cy.findByText('Assign a public IPv4 address for this Linode')
                    .should('be.visible')
                    .click();
                // Confirm that internet access warning is displayed.
                cy.findByText(constants_1.NATTED_PUBLIC_IP_HELPER_TEXT).scrollIntoView();
                cy.findByText(constants_1.NATTED_PUBLIC_IP_HELPER_TEXT).should('be.visible');
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Add Configuration')
                    .scrollIntoView();
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Add Configuration')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait(['@createLinodeConfig', '@getLinodeConfigs', '@getVPC']);
            // Confirm that Public Internet assigned to eth0, VPC to eth1,
            // and that "REBOOT NEEDED" status message is shown.
            cy.findByLabelText('List of Configurations').within(function () {
                cy.contains("".concat(mockConfig.label, " \u2013 ").concat(mockKernel.label)).should('be.visible');
                cy.contains('eth0 – Public Internet').should('be.visible');
                cy.contains("eth1 \u2013 VPC: ".concat(mockVPC.label)).should('be.visible');
            });
            cy.findByText('REBOOT NEEDED').should('be.visible');
        });
    });
});
