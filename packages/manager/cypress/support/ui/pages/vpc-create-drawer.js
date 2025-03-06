"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vpcCreateDrawer = void 0;
var ui_1 = require("support/ui");
/**
 * Page utilities for interacting with the VPC create drawer.
 *
 * Assumes that selection context is limited to only the drawer.
 */
exports.vpcCreateDrawer = {
    /**
     * Sets the VPC create form's label field.
     *
     * @param vpcLabel - VPC label to set.
     */
    setLabel: function (vpcLabel) {
        cy.findByLabelText('VPC Label')
            .should('be.visible')
            .type("{selectall}{del}".concat(vpcLabel));
    },
    /**
     * Sets the VPC create form's description field.
     *
     * @param vpcDescription - VPC description to set.
     */
    setDescription: function (vpcDescription) {
        cy.findByLabelText('Description', { exact: false })
            .should('be.visible')
            .type("{selectall}{del}".concat(vpcDescription));
    },
    /**
     * Sets the VPC create form's subnet label.
     *
     * When handling more than one subnet, an index can be provided to control
     * which field is being modified.
     *
     * @param subnetLabel - Label to set.
     * @param subnetIndex - Optional index of subnet for which to update label.
     */
    setSubnetLabel: function (subnetLabel, subnetIndex) {
        if (subnetIndex === void 0) { subnetIndex = 0; }
        cy.findByText('Subnet Label', {
            selector: "label[for=\"subnet-label-".concat(subnetIndex, "\"]"),
        })
            .should('be.visible')
            .click();
        cy.focused().type("{selectall}{del}".concat(subnetLabel));
    },
    /**
     * Sets the VPC create form's subnet IP address.
     *
     * When handling more than one subnet, an index can be provided to control
     * which field is being modified.
     *
     * @param subnetIpRange - IP range to set.
     * @param subnetIndex - Optional index of subnet for which to update IP range.
     */
    setSubnetIpRange: function (subnetIpRange, subnetIndex) {
        if (subnetIndex === void 0) { subnetIndex = 0; }
        cy.findByText('Subnet IP Address Range', {
            selector: "label[for=\"subnet-ipv4-".concat(subnetIndex, "\"]"),
        })
            .should('be.visible')
            .click();
        cy.focused().type("{selectall}{del}".concat(subnetIpRange));
    },
    /**
     * Submits the VPC create form.
     */
    submit: function () {
        ui_1.ui.buttonGroup
            .findButtonByTitle('Create VPC')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
    },
};
