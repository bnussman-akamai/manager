"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("@linode/ui");
var React = require("react");
var ui_2 = require("support/ui");
var components_1 = require("support/util/components");
var components_2 = require("support/util/components");
var options = [
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' },
    { label: 'Option 3', value: 'option-3' },
];
var openAutocompletePopper = function () {
    ui_2.ui.button
        .findByAttribute('title', 'Open')
        .should('be.visible')
        .should('be.enabled')
        .click();
};
(0, components_2.componentTests)('Select', function (mount) {
    describe('Basics', function () {
        describe('Open menu', function () {
            it('can open drop-down menu by clicking drop-down arrow', function () {
                mount(<ui_1.Select {...defaultProps}/>);
                openAutocompletePopper();
                ui_2.ui.autocompletePopper
                    .find()
                    .should('be.visible')
                    .within(function () {
                    cy.get('li').should('have.length', options.length);
                });
                options.forEach(function (option) {
                    ui_2.ui.autocompletePopper
                        .findByTitle("".concat(option.label))
                        .should('be.visible');
                });
            });
            it('should show a "No options found" message when no options are found', function () {
                mount(<ui_1.Select {...defaultProps} options={[]}/>);
                openAutocompletePopper();
                ui_2.ui.autocompletePopper
                    .find()
                    .should('be.visible')
                    .within(function () {
                    cy.contains('No options available').should('be.visible');
                });
            });
            it('can close menu with ESC key', function () {
                mount(<ui_1.Select {...defaultProps}/>);
                openAutocompletePopper();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[0].label))
                    .should('be.visible');
                cy.get('body').type('{esc}');
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            it('can close autocomplete popper by clicking away', function () {
                mount(<>
            <span id="other-element">Other Element</span>
            <ui_1.Select {...defaultProps}/>
          </>);
                openAutocompletePopper();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[0].label))
                    .should('be.visible');
                cy.get('#other-element').click();
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
        });
        describe('Selection', function () {
            it('can select an option initially', function () {
                mount(<ui_1.Select {...defaultProps}/>);
                openAutocompletePopper();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[0].label))
                    .should('be.visible')
                    .click();
                cy.get('input').should('have.attr', 'value', "".concat(options[0].label));
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
                openAutocompletePopper();
                ui_2.ui.autocompletePopper
                    .find()
                    .should('be.visible')
                    .within(function () {
                    cy.get('li').should('have.length', options.length);
                    cy.contains("".concat(options[0].label))
                        .should('be.visible')
                        .should('have.attr', 'aria-selected', 'true');
                });
            });
            it('can select an option by typing', function () {
                mount(<ui_1.Select {...defaultProps} searchable/>);
                cy.get('input').should('have.attr', 'placeholder', 'Select an option');
                cy.findByText('My Select').should('be.visible').click();
                cy.focused().type(options[0].label[0]);
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[0].label))
                    .should('be.visible')
                    .click();
                cy.get('input').should('have.attr', 'value', "".concat(options[0].label));
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            it('can change region selection', function () {
                mount(<ui_1.Select {...defaultProps} value={{
                        label: options[0].label,
                        value: options[0].value,
                    }}/>);
                openAutocompletePopper();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[1].label))
                    .scrollIntoView()
                    .should('be.visible')
                    .click();
                cy.get('input').should('have.attr', 'value', "".concat(options[1].label));
                cy.get('[data-qa-autocomplete-popper]').should('not.exist');
            });
            it('can clear region selection', function () {
                mount(<ui_1.Select {...defaultProps} value={{
                        label: options[1].label,
                        value: options[1].value,
                    }} clearable/>);
                cy.get('input').should('have.attr', 'value', "".concat(options[1].label));
                cy.findByLabelText('Clear')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.get('input').should('have.attr', 'value', '');
                cy.get('input').should('have.attr', 'placeholder', 'Select an option');
            });
            it('cannot clear region selection when clearable is disabled', function () {
                mount(<ui_1.Select {...defaultProps} value={{
                        label: options[1].label,
                        value: options[1].value,
                    }} clearable={false}/>);
                cy.get('input').should('have.attr', 'value', "".concat(options[1].label));
                cy.findByLabelText('Clear').should('not.exist');
            });
            it('cannot clear region selection when no region is selected', function () {
                mount(<ui_1.Select {...defaultProps}/>);
                cy.get('input').should('have.attr', 'value', '');
                cy.get('input').should('have.attr', 'placeholder', 'Select an option');
                cy.findByLabelText('Clear').should('not.exist');
            });
            it('calls `onChange` callback when region is initially selected', function () {
                var spyFn = (0, components_1.createSpy)(function () { }, 'changeSpy');
                mount(<ui_1.Select {...defaultProps} onChange={spyFn}/>);
                openAutocompletePopper();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(options[1].label))
                    .should('be.visible')
                    .click();
                cy.get('@changeSpy').should('have.been.calledOnce');
            });
            it('calls `onChange` callback when region is cleared (if clearable is true)', function () {
                var spyFn = (0, components_1.createSpy)(function () { }, 'changeSpy');
                mount(<ui_1.Select {...defaultProps} value={{
                        label: options[1].label,
                        value: options[1].value,
                    }} clearable onChange={spyFn}/>);
                cy.findByLabelText('Clear')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.get('@changeSpy').should('have.been.calledOnce');
            });
        });
    });
    describe('Creatable', function () {
        it('can create a new option', function () {
            mount(<ui_1.Select {...defaultProps} creatable/>);
            var newOption = 'New Option';
            cy.get('input').should('have.attr', 'placeholder', 'Select an option');
            cy.findByText('My Select').should('be.visible').click();
            cy.focused().type(newOption);
            ui_2.ui.autocompletePopper
                .find()
                .within(function () {
                cy.contains("Create \"".concat(newOption, "\"")).should('be.visible');
            })
                .click();
            cy.get('input').should('have.attr', 'value', newOption);
        });
    });
    var defaultProps = {
        label: 'My Select',
        onChange: function () { },
        options: options,
        placeholder: 'Select an option',
    };
    describe('Logic', function () {
        var WrappedSelect = function (props) {
            var _a = React.useState(null), value = _a[0], setValue = _a[1];
            return (<>
          <ui_1.Select {...defaultProps} onChange={function (_, newValue) {
                    var _a, _b;
                    return setValue({
                        label: (_a = newValue === null || newValue === void 0 ? void 0 : newValue.label) !== null && _a !== void 0 ? _a : '',
                        value: (_b = newValue === null || newValue === void 0 ? void 0 : newValue.value.toString().replace(' ', '-').toLowerCase()) !== null && _b !== void 0 ? _b : '',
                    });
                }} textFieldProps={{
                    onChange: function (e) {
                        return setValue({
                            label: e.target.value,
                            value: e.target.value.replace(' ', '-').toLowerCase(),
                        });
                    },
                }} value={value} {...props}/>
          <ui_1.Box sx={{ mt: 2 }}>
            <ui_1.Typography data-qa-selected-value>
              {JSON.stringify(value)}
            </ui_1.Typography>
          </ui_1.Box>
        </>);
        };
        it('renders the value for an existing option', function () {
            mount(<WrappedSelect />);
            cy.get('[data-qa-selected-value]').should('have.text', 'null');
            options.forEach(function (option) {
                openAutocompletePopper();
                ui_2.ui.autocompletePopper
                    .findByTitle("".concat(option.label))
                    .should('be.visible')
                    .click();
                cy.get('[data-qa-selected-value]').should('have.text', "{\"label\":\"".concat(option.label, "\",\"value\":\"").concat(option.value, "\"}"));
            });
        });
        it('renders the value for a new option', function () {
            mount(<WrappedSelect creatable/>);
            var newOption = 'New Option';
            cy.get('[data-qa-selected-value]').should('have.text', 'null');
            openAutocompletePopper();
            cy.focused().type(newOption);
            ui_2.ui.autocompletePopper
                .find()
                .within(function () {
                cy.contains("Create \"".concat(newOption, "\"")).should('be.visible');
            })
                .click();
            cy.get('[data-qa-selected-value]').should('have.text', "{\"label\":\"".concat(newOption, "\",\"value\":\"").concat(newOption
                .replace(' ', '-')
                .toLowerCase(), "\"}"));
        });
    });
});
