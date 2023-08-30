import * as React from 'react';
import { ControlProps } from 'react-select';

import { TextField } from 'src/components/TextField';

type Props = ControlProps<any, any>;

const SelectControl: React.FC<Props> = (props) => {
  return (
    <TextField
      data-qa-enhanced-select={
        props.selectProps.value
          ? props.selectProps.value.label
          : props.selectProps.placeholder
      }
      inputProps={{
        children: props.children,
        className: props.selectProps.classes.input,
        ref: props.innerRef,
      }}
      fullWidth
      inputComponent={'div'}
      {...props.innerProps}
      {...props.selectProps.textFieldProps}
    />
  );
};

export default SelectControl;
