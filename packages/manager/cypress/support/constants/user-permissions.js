"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPermissionsGrants = void 0;
var random_1 = require("support/util/random");
var grants_1 = require("src/factories/grants");
/**
 * User permission grants with all permissions restricted.
 */
exports.userPermissionsGrants = grants_1.grantsFactory.build({
    global: {
        account_access: null,
        cancel_account: false,
        child_account_access: false,
        add_domains: false,
        add_firewalls: false,
        add_images: false,
        add_linodes: false,
        add_longview: false,
        add_nodebalancers: false,
        add_stackscripts: false,
        add_databases: false,
        add_volumes: false,
        add_vpcs: false,
        longview_subscription: false,
    },
    database: grants_1.grantFactory.buildList(1, {
        label: (0, random_1.randomLabel)(),
        permissions: null,
    }),
    domain: grants_1.grantFactory.buildList(1, {
        label: (0, random_1.randomLabel)(),
        permissions: null,
    }),
    firewall: grants_1.grantFactory.buildList(1, {
        label: (0, random_1.randomLabel)(),
        permissions: null,
    }),
    image: grants_1.grantFactory.buildList(1, { label: (0, random_1.randomLabel)(), permissions: null }),
    linode: grants_1.grantFactory.buildList(1, {
        label: (0, random_1.randomLabel)(),
        permissions: null,
    }),
    longview: grants_1.grantFactory.buildList(1, {
        label: (0, random_1.randomLabel)(),
        permissions: null,
    }),
    nodebalancer: grants_1.grantFactory.buildList(1, {
        label: (0, random_1.randomLabel)(),
        permissions: null,
    }),
    stackscript: grants_1.grantFactory.buildList(1, {
        label: (0, random_1.randomLabel)(),
        permissions: null,
    }),
    volume: grants_1.grantFactory.buildList(1, {
        label: (0, random_1.randomLabel)(),
        permissions: null,
    }),
    vpc: grants_1.grantFactory.buildList(1, { label: (0, random_1.randomLabel)(), permissions: null }),
});
