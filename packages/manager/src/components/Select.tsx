import { FormControlProps } from '@mui/material';
import _Select, { SelectProps } from '@mui/material/Select';
import React from 'react';

import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

import { FormControl } from './FormControl';
import { InputLabel } from './InputLabel';

interface Props {
  FormControlProps?: FormControlProps;
  SelectProps?: SelectProps;
  children: SelectProps['children'];
  label: string;
}

export const Select = (props: Props) => {
  const { SelectProps, children, label } = props;

  const id = convertToKebabCase(label);
  const labelId = `${id}-label`;

  return (
    <FormControl>
      <InputLabel id={labelId}>{label}</InputLabel>
      <_Select id={id} labelId={labelId} {...SelectProps}>
        {children}
      </_Select>
    </FormControl>
  );
};
