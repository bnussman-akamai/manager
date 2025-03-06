"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("@linode/ui");
var React = require("react");
var ui_2 = require("support/ui");
var accessibility_1 = require("support/util/accessibility");
var components_1 = require("support/util/components");
var components_2 = require("support/util/components");
(0, components_1.componentTests)('Autocomplete', function (mount) {
    var options = Array.from({ length: 3 }, function (_, index) {
        var num = index + 1;
        return {
            label: "my-option-".concat(num),
            value: "my-option-".concat(num),
        };
    });
    describe('Autocomplete interactions', function () {
        describe('Open menu', function () {
            /**
             * - Confirms dropbdown can be opened by clicking the arrow button
             */
            it('can open the drop-down menu by clicking the drop-down arrow', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" options={options}/>);
                ui_2.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[0].label))
                    .should('be.visible');
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[1].label))
                    .should('be.visible');
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[2].label))
                    .should('be.visible');
            });
            /**
             * - Confirms dropdown can be opened by typing in the textfield
             */
            it('can open the drop-down menu by typing into the textfield area', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" options={options}/>);
                // Focus text field by clicking "Autocomplete" label.
                cy.findByText('Autocomplete').should('be.visible').click();
                cy.focused().type(options[0].label);
                ui_2.ui.autocompletePopper.find().within(function () {
                    cy.findByText(options[0].label).should('be.visible');
                    cy.findByText(options[1].label).should('not.exist');
                    cy.findByText(options[2].label).should('not.exist');
                });
            });
            /**
             * - Confirms dropdown menu when there are no options
             */
            it('shows the open dropdown menu with no options text', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" options={[]}/>);
                ui_2.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.contains('You have no options to choose from').should('be.visible');
            });
        });
        describe('Closing menu', function () {
            // esc, click away, up arrow
            /**
             * - Confirms autocomplete popper can be closed with the ESC key
             */
            it('can close the autocomplete menu with ESC key', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" onChange={function () { }} options={options}/>);
                ui_2.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_2.ui.autocompletePopper
                    .findByTitle(options[0].label)
                    .should('be.visible');
                cy.get('input').type('{esc}');
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            /**
             * Confirms autocomplete can be closed by clicking away
             */
            it('can close autocomplete popper by clicking away', function () {
                mount(<>
            <span id="other-element">Other Element</span>
            <ui_1.Autocomplete label="Autocomplete" onChange={function () { }} options={options}/>
          </>);
                ui_2.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_2.ui.autocompletePopper
                    .findByTitle(options[0].label)
                    .should('be.visible');
                cy.get('#other-element').click();
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            /**
             * Confirms autocomplete can be closed by clicking the close button
             */
            it('can close autocomplete popper by clicking the close button', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" onChange={function () { }} options={options}/>);
                ui_2.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[0].label))
                    .should('be.visible');
                ui_2.ui.button
                    .findByAttribute('title', 'Close')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
        });
        describe('Single-select', function () {
            /**
             * - Confirms user can select an initial option
             */
            it('can select an initial option', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" onChange={function () { }} options={options} placeholder="this is a placeholder" value={undefined}/>);
                cy.get('input').should('have.attr', 'placeholder', 'this is a placeholder');
                cy.get('input').should('have.attr', 'value', '');
                cy.findByText('Autocomplete').should('be.visible').click();
                cy.focused().type(options[0].label);
                ui_2.ui.autocompletePopper
                    .findByTitle(options[0].label)
                    .scrollIntoView()
                    .should('be.visible')
                    .click();
                // Confirm that selection change is reflected by input field value, and that
                // the autocomplete popper has been dismissed.
                cy.get('input').should('have.attr', 'value', "".concat(options[0].label));
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            /**
             * - Confirms user can change selection after having selected an option
             */
            it('can change the selected option', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" onChange={function () { }} options={options} placeholder="this is a placeholder" value={options[0]}/>);
                cy.get('input').should('have.attr', 'value', "".concat(options[0].label));
                cy.findByText('Autocomplete').should('be.visible').click();
                cy.focused().type(options[1].label);
                ui_2.ui.autocompletePopper
                    .findByTitle(options[1].label)
                    .scrollIntoView()
                    .should('be.visible')
                    .click();
                // Confirm that selection change is reflected by input field value, and that
                // the autocomplete popper has been dismissed.
                cy.get('input').should('have.attr', 'value', "".concat(options[1].label));
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            /**
             * - Confirms selection option can be cleared
             */
            it('clears the selected option', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" onChange={function () { }} options={options} placeholder="this is a placeholder" value={options[0]}/>);
                cy.get('input').should('have.attr', 'value', "".concat(options[0].label));
                cy.findByLabelText('Clear')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.get('input').should('have.attr', 'value', '');
                cy.get('input').should('have.attr', 'placeholder', 'this is a placeholder');
            });
            /**
             * - Confirms selection cannot be cleared when clearable is disabled
             */
            it('cannot clear the selected option when clearable is disabled', function () {
                mount(<ui_1.Autocomplete disableClearable label="Autocomplete" onChange={function () { }} options={options} placeholder="this is a placeholder" value={options[0]}/>);
                cy.get('input').should('have.attr', 'value', "".concat(options[0].label));
                cy.findByLabelText('Clear').should('not.exist');
            });
            /**
             * - Confirms selection cannot be cleared if nothing was chosen
             */
            it('cannot clear selection when nothing is selected', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" onChange={function () { }} options={options} placeholder="this is a placeholder" value={undefined}/>);
                cy.get('input').should('have.attr', 'value', '');
                cy.get('input').should('have.attr', 'placeholder', 'this is a placeholder');
                cy.findByLabelText('Clear').should('not.exist');
            });
            describe('onChange', function () {
                /**
                 * - Confirms onChange is called when option is selected
                 */
                it('calls `onChange` callback when initially selecting option', function () {
                    var spyFn = (0, components_2.createSpy)(function () { }, 'changeSpy');
                    mount(<ui_1.Autocomplete label="Autocomplete" onChange={spyFn} options={options} placeholder="this is a placeholder" value={undefined}/>);
                    cy.findByText('Autocomplete').should('be.visible').click();
                    cy.focused().type(options[0].label);
                    ui_2.ui.autocompletePopper
                        .findByTitle("".concat(options[0].label))
                        .scrollIntoView()
                        .should('be.visible')
                        .click();
                    cy.get('@changeSpy').should('have.been.calledOnce');
                });
                /**
                 * - Confirms `onChange` callback when option is cleared
                 */
                it('calls `onChange` callback when clearing selection', function () {
                    var spyFn = (0, components_2.createSpy)(function () { }, 'changeSpy');
                    mount(<ui_1.Autocomplete label="Autocomplete" onChange={spyFn} options={options} placeholder="this is a placeholder" value={options[0]}/>);
                    cy.findByLabelText('Clear')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                    cy.get('@changeSpy').should('have.been.calledOnce');
                });
                /**
                 * - Confirms `onChange` callback when option is changed
                 */
                it('calls `onChange` callback changing selection', function () {
                    var spyFn = (0, components_2.createSpy)(function () { }, 'changeSpy');
                    mount(<ui_1.Autocomplete label="Autocomplete" onChange={spyFn} options={options} placeholder="this is a placeholder" value={options[1]}/>);
                    cy.findByText('Autocomplete').should('be.visible').click();
                    cy.focused().type(options[0].label);
                    ui_2.ui.autocompletePopper
                        .findByTitle("".concat(options[0].label))
                        .scrollIntoView()
                        .should('be.visible')
                        .click();
                    cy.get('@changeSpy').should('have.been.calledOnce');
                });
            });
            /**
             * - Confirms onBlur is called when focusing away from selection
             */
            it('calls `onBlur` callback when focusing away from selection', function () {
                var spyFn = (0, components_2.createSpy)(function () { }, 'changeSpy');
                mount(<>
            <span id="other-element">Other Element</span>
            <ui_1.Autocomplete label="Autocomplete" onBlur={spyFn} onChange={function () { }} options={options} placeholder="this is a placeholder" value={undefined}/>
          </>);
                cy.findByText('Autocomplete').should('be.visible').click();
                cy.focused().type(options[0].label);
                ui_2.ui.autocompletePopper
                    .findByTitle(options[0].label)
                    .scrollIntoView()
                    .should('be.visible')
                    .click();
                cy.get('#other-element').click();
                cy.get('@changeSpy').should('have.been.calledOnce');
            });
        });
        describe('Multiselection', function () {
            /**
             * - Confirms multiple selections can be chosen
             * - Confirms clear button clears all options
             */
            it('can select multiple options and clears all selected options', function () {
                // figure out how to confirm multi selections
                // input value doesn't work anymore... (this feels hacky)
                var MultiSelect = function () {
                    var _a = React.useState([]), selectedOptions = _a[0], setSelectedOptions = _a[1];
                    return (<>
              <div>Number of selected options: {selectedOptions.length}</div>
              <ui_1.Autocomplete label="Linodes" multiple onChange={function (_, value) { return setSelectedOptions(value); }} options={options} value={selectedOptions}/>
            </>);
                };
                mount(<MultiSelect />);
                ui_2.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_2.ui.autocompletePopper.findByTitle('Select All').should('be.visible');
                ui_2.ui.autocompletePopper
                    .findByTitle(options[0].label)
                    .should('be.visible')
                    .click();
                cy.findByText('Number of selected options: 1').should('be.visible');
                ui_2.ui.autocompletePopper
                    .findByTitle(options[1].label)
                    .should('be.visible')
                    .click();
                cy.findByText('Number of selected options: 2').should('be.visible');
                cy.findByLabelText('Clear')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.findByText('Number of selected options: 0').should('be.visible');
            });
            /**
             * - Confirms 'Select All' and 'Deselect All' work as expected
             */
            it('can select all and deselect all', function () {
                var MultiSelect = function () {
                    var _a = React.useState([]), selectedOptions = _a[0], setSelectedOptions = _a[1];
                    return (<ui_1.Autocomplete label="Linodes" multiple onChange={function (_, value) { return setSelectedOptions(value); }} options={options} value={selectedOptions}/>);
                };
                mount(<MultiSelect />);
                ui_2.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_2.ui.autocompletePopper
                    .findByTitle('Select All')
                    .should('be.visible')
                    .click();
                cy.findByLabelText('Clear').should('be.visible').should('be.enabled');
                cy.contains('Select All').should('not.exist');
                // After selecting all elements, 'Deselect All' appears as an option
                ui_2.ui.autocompletePopper
                    .findByTitle('Deselect All')
                    .should('be.visible')
                    .click();
                cy.findByLabelText('Clear').should('not.exist');
                ui_2.ui.autocompletePopper.findByTitle('Select All').should('be.visible');
            });
            /**
             * - Confirms 'Deselect All' appears only when all options are selected (even if 'Select All' wasn't clicked)
             * - Confirms 'Select All' appears if not all options have been selected
             */
            it('shows Deselect All if all options are selected', function () {
                var MultiSelect = function () {
                    var _a = React.useState([]), selectedOptions = _a[0], setSelectedOptions = _a[1];
                    return (<ui_1.Autocomplete label="Linodes" multiple onChange={function (_, value) { return setSelectedOptions(value); }} options={options} value={selectedOptions}/>);
                };
                mount(<MultiSelect />);
                ui_2.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // select all options manually, confirm Select all is still visible if not all options selected yet
                ui_2.ui.autocompletePopper.findByTitle('Select All').should('be.visible');
                ui_2.ui.autocompletePopper
                    .findByTitle('my-option-1')
                    .should('be.visible')
                    .click();
                ui_2.ui.autocompletePopper.findByTitle('Select All').should('be.visible');
                ui_2.ui.autocompletePopper
                    .findByTitle('my-option-2')
                    .should('be.visible')
                    .click();
                ui_2.ui.autocompletePopper.findByTitle('Select All').should('be.visible');
                ui_2.ui.autocompletePopper
                    .findByTitle('my-option-3')
                    .should('be.visible')
                    .click();
                // Confirm Deselect All appears, and Select All doesn't exist anymore
                ui_2.ui.autocompletePopper.findByTitle('Deselect All').should('be.visible');
                cy.contains('Select All').should('not.exist');
            });
            /**
             * - Confirms popper remains open in multiselect after selecting an element
             */
            it('keeps the popper open even after an element is selected', function () {
                mount(<ui_1.Autocomplete label="Autocomplete" multiple onChange={function () { }} options={options}/>);
                ui_2.ui.button
                    .findByAttribute('title', 'Open')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[1].label))
                    .should('be.visible')
                    .click();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[1].label))
                    .should('be.visible');
                cy.get('[data-qa-autocomplete-popper]').should('be.visible');
            });
        });
        (0, components_1.visualTests)(function (mount) {
            describe('Accessibility checks', function () {
                describe('Single select', function () {
                    it('passes aXe check when menu is closed without an item selected', function () {
                        mount(<ui_1.Autocomplete label={'Autocomplete'} options={options}/>);
                        (0, accessibility_1.checkComponentA11y)();
                    });
                    it('passes aXe check when menu is closed with an item selected', function () {
                        mount(<ui_1.Autocomplete label={'Autocomplete'} options={options} value={options[0]}/>);
                        (0, accessibility_1.checkComponentA11y)();
                    });
                    it('passes aXe check when menu is open with an item selected', function () {
                        mount(<ui_1.Autocomplete label={'Autocomplete'} options={options} value={options[0]}/>);
                        ui_2.ui.button
                            .findByAttribute('title', 'Open')
                            .should('be.visible')
                            .should('be.enabled')
                            .click();
                        (0, accessibility_1.checkComponentA11y)();
                    });
                });
                describe('MultiSelect', function () {
                    it('passes aXe check when menu is closed without an item selected', function () {
                        mount(<ui_1.Autocomplete label={'Autocomplete'} multiple options={options}/>);
                        (0, accessibility_1.checkComponentA11y)();
                    });
                    it('passes aXe check when menu is closed with an item selected', function () {
                        mount(<ui_1.Autocomplete label={'Autocomplete'} multiple options={options} value={[options[0]]}/>);
                        (0, accessibility_1.checkComponentA11y)();
                    });
                    it('passes aXe check when menu is open with an item selected', function () {
                        mount(<ui_1.Autocomplete label={'Autocomplete'} multiple options={options} value={[options[0]]}/>);
                        ui_2.ui.button
                            .findByAttribute('title', 'Open')
                            .should('be.visible')
                            .should('be.enabled')
                            .click();
                        (0, accessibility_1.checkComponentA11y)();
                    });
                });
            });
        });
    });
});
