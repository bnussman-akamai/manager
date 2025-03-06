"use strict";
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
var React = require("react");
var account_1 = require("support/intercepts/account");
var ui_1 = require("support/ui");
var accessibility_1 = require("support/util/accessibility");
var components_1 = require("support/util/components");
var components_2 = require("support/util/components");
var RegionSelect_1 = require("src/components/RegionSelect/RegionSelect");
var factories_1 = require("src/factories");
(0, components_2.componentTests)('RegionSelect', function (mount) {
    beforeEach(function () {
        (0, account_1.mockGetAccountAvailability)([]);
    });
    describe('Interactions', function () {
        describe('Open menu', function () {
            /*
             * - Region selection drop-down can be opened by clicking arrow button.
             */
            it('can open drop-down menu by clicking drop-down arrow', function () {
                var region = factories_1.regionFactory.build({
                    capabilities: ['Object Storage'],
                });
                mount(<RegionSelect_1.RegionSelect currentCapability="Object Storage" onChange={function () { }} regions={[region]} value={undefined}/>);
                ui_1.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(region.label, " (").concat(region.id, ")"))
                    .should('be.visible');
            });
            /*
             * - Region selection drop-down can be opened by typing into text field.
             */
            it('can open menu by typing into text field', function () {
                var region = factories_1.regionFactory.build({
                    capabilities: ['Object Storage'],
                });
                mount(<RegionSelect_1.RegionSelect currentCapability="Object Storage" onChange={function () { }} regions={[region]} value={undefined}/>);
                // Focus text field by clicking "Region" label.
                cy.findByText('Region').should('be.visible').click();
                cy.focused().type(region.label[0]);
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(region.label, " (").concat(region.id, ")"))
                    .should('be.visible');
            });
        });
        describe('Close menu', function () {
            /*
             * - Region selection drop-down can be dismissed by pressing the ESC key.
             */
            it('can close menu with ESC key', function () {
                var region = factories_1.regionFactory.build({
                    capabilities: ['Object Storage'],
                });
                mount(<RegionSelect_1.RegionSelect currentCapability="Object Storage" onChange={function () { }} regions={[region]} value={undefined}/>);
                ui_1.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(region.label, " (").concat(region.id, ")"))
                    .should('be.visible');
                cy.get('input').type('{esc}');
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            it('can close autocomplete popper by clicking away', function () {
                var region = factories_1.regionFactory.build({
                    capabilities: ['Object Storage'],
                });
                mount(<>
            <span id="other-element">Other Element</span>
            <RegionSelect_1.RegionSelect currentCapability="Object Storage" onChange={function () { }} regions={[region]} value={undefined}/>
          </>);
                ui_1.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(region.label, " (").concat(region.id, ")"))
                    .should('be.visible');
                cy.get('#other-element').click();
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
        });
        describe('Selection', function () {
            var regionToPreselect = factories_1.regionFactory.build();
            var regionToSelect = factories_1.regionFactory.build();
            var otherRegions = factories_1.regionFactory.buildList(10);
            var regions = __spreadArray([regionToPreselect, regionToSelect], otherRegions, true);
            it('can select a region initially', function () {
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={function () { }} regions={regions} value={undefined}/>);
                cy.get('input').should('have.attr', 'placeholder', 'Select a Region');
                cy.findByText('Region').should('be.visible').click();
                cy.focused().type(regionToSelect.label[0]);
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(regionToSelect.label, " (").concat(regionToSelect.id, ")"))
                    .scrollIntoView()
                    .should('be.visible')
                    .click();
                // Confirm that selection change is reflected by input field value, and that
                // the autocomplete popper has been dismissed.
                cy.get('input').should('have.attr', 'value', "".concat(regionToSelect.label, " (").concat(regionToSelect.id, ")"));
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            /*
             * - User can can selection after having already selected a region.
             */
            it('can change region selection', function () {
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={function () { }} regions={regions} value={regionToPreselect.id}/>);
                cy.get('input').should('have.attr', 'value', "".concat(regionToPreselect.label, " (").concat(regionToPreselect.id, ")"));
                cy.findByText('Region').should('be.visible').click();
                cy.focused().type(regionToSelect.label[0]);
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(regionToSelect.label, " (").concat(regionToSelect.id, ")"))
                    .scrollIntoView()
                    .should('be.visible')
                    .click();
                cy.get('input').should('have.attr', 'value', "".concat(regionToSelect.label, " (").concat(regionToSelect.id, ")"));
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            it('can clear region selection', function () {
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={function () { }} regions={regions} value={regionToSelect.id}/>);
                cy.get('input').should('have.attr', 'value', "".concat(regionToSelect.label, " (").concat(regionToSelect.id, ")"));
                cy.findByLabelText('Clear')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.get('input').should('have.attr', 'value', '');
                cy.get('input').should('have.attr', 'placeholder', 'Select a Region');
            });
            it('cannot clear region selection when clearable is disabled', function () {
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} disableClearable={true} onChange={function () { }} regions={regions} value={regionToSelect.id}/>);
                cy.get('input').should('have.attr', 'value', "".concat(regionToSelect.label, " (").concat(regionToSelect.id, ")"));
                cy.findByLabelText('Clear').should('not.exist');
            });
            it('cannot clear region selection when no region is selected', function () {
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={function () { }} regions={regions} value={undefined}/>);
                cy.get('input').should('have.attr', 'value', '');
                cy.get('input').should('have.attr', 'placeholder', 'Select a Region');
                cy.findByLabelText('Clear').should('not.exist');
            });
            it('calls `onChange` callback when region is initially selected', function () {
                var spyFn = (0, components_1.createSpy)(function () { }, 'changeSpy');
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={spyFn} regions={regions} value={undefined}/>);
                cy.findByText('Region').should('be.visible').click();
                cy.focused().type(regionToSelect.label[0]);
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(regionToSelect.label, " (").concat(regionToSelect.id, ")"))
                    .scrollIntoView()
                    .should('be.visible')
                    .click();
                cy.get('@changeSpy').should('have.been.calledOnce');
            });
            it('calls `onChange` callback when region is cleared', function () {
                var spyFn = (0, components_1.createSpy)(function () { }, 'changeSpy');
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={spyFn} regions={regions} value={regionToSelect.id}/>);
                cy.findByLabelText('Clear')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.get('@changeSpy').should('have.been.calledOnce');
            });
        });
    });
    describe('Logic', function () {
        // TODO Gecko tests.
        var regionsWithObj = factories_1.regionFactory.buildList(5, {
            capabilities: ['Object Storage'],
        });
        var regionsWithoutObj = factories_1.regionFactory.buildList(5, {
            capabilities: [],
        });
        var regionWithoutAvailability = factories_1.regionFactory.build({
            capabilities: ['Object Storage'],
        });
        var regions = __spreadArray(__spreadArray(__spreadArray([], regionsWithObj, true), regionsWithoutObj, true), [
            regionWithoutAvailability,
        ], false);
        it('excludes regions without availability (DC Get Well)', function () {
            var mockAvailability = factories_1.accountAvailabilityFactory.build({
                region: regionWithoutAvailability.id,
                unavailable: ['Object Storage'],
            });
            (0, account_1.mockGetAccountAvailability)([mockAvailability]);
            // TODO Remove `dcGetWell` flag override when feature flag is removed from codebase.
            mount(<RegionSelect_1.RegionSelect currentCapability="Object Storage" onChange={function () { }} regions={regions} value={undefined}/>, {
                dcGetWell: true,
            });
            ui_1.ui.button
                .findByAttribute('title', 'Open')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText("".concat(regionWithoutAvailability.label, " (").concat(regionWithoutAvailability.id, ")"))
                .as('regionItem')
                .scrollIntoView();
            cy.get('@regionItem').should('be.visible');
            cy.findByText("".concat(regionWithoutAvailability.label, " (").concat(regionWithoutAvailability.id, ")"))
                .closest('li')
                .should('have.attr', 'data-qa-disabled-item', 'true');
        });
        it('only lists regions with the specified capability', function () {
            mount(<RegionSelect_1.RegionSelect currentCapability="Object Storage" onChange={function () { }} regions={regions} value={undefined}/>);
            ui_1.ui.button
                .findByAttribute('title', 'Open')
                .should('be.visible')
                .should('be.enabled')
                .click();
            regionsWithObj.forEach(function (region) {
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(region.label, " (").concat(region.id, ")"))
                    .scrollIntoView()
                    .should('be.visible');
            });
            regionsWithoutObj.forEach(function (region) {
                ui_1.ui.autocompletePopper.find().within(function () {
                    cy.findByText("".concat(region.label, " (").concat(region.id, ")")).should('not.exist');
                });
            });
        });
        it('lists all regions when no capability is specified', function () {
            mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={function () { }} regions={regions} value={undefined}/>);
            ui_1.ui.button
                .findByAttribute('title', 'Open')
                .should('be.visible')
                .should('be.enabled')
                .click();
            regions.forEach(function (region) {
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(region.label, " (").concat(region.id, ")"))
                    .scrollIntoView()
                    .should('be.visible');
            });
        });
    });
    (0, components_2.visualTests)(function (mount) {
        describe('Accessibility checks', function () {
            var selectedRegion = factories_1.regionFactory.build();
            var regions = __spreadArray([selectedRegion], factories_1.regionFactory.buildList(5), true);
            it('passes aXe check when menu is closed without an item selected', function () {
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={function () { }} regions={regions} value={undefined}/>);
                (0, accessibility_1.checkComponentA11y)();
            });
            it('passes aXe check when menu is closed with an item selected', function () {
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={function () { }} regions={regions} value={selectedRegion.id}/>);
                (0, accessibility_1.checkComponentA11y)();
            });
            it('passes aXe check when menu is open', function () {
                mount(<RegionSelect_1.RegionSelect currentCapability={undefined} onChange={function () { }} regions={regions} value={selectedRegion.id}/>);
                ui_1.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                (0, accessibility_1.checkComponentA11y)();
            });
        });
    });
});
