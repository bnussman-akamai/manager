import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { VLANFactory } from 'src/factories';
import { useVlansQuery } from 'src/queries/vlans';

import type { VLAN } from '@linode/api-v4';
import type { TextFieldProps } from 'src/components/TextField';

interface Props {
  /**
   * Error text to display as helper text under the TextField. Useful for validation errors.
   */
  errorText?: string;
  /**
   * Called when the value of the Select changes
   */
  onChange: (vlan: VLAN | null) => void;
  /**
   * Optional props passed to the TextField
   */
  textFieldProps?: Partial<TextFieldProps>;
  /**
   * The label of the selected VLAN
   */
  value: null | string;
}

export const VLANSelect = (props: Props) => {
  const { errorText, onChange, textFieldProps, value } = props;

  const [inputValue, setInputValue] = React.useState<string>('');

  const { data: vlans, error, isLoading } = useVlansQuery();

  const selectedVLAN = value
    ? vlans?.find((vlan) => vlan.label === value) ?? null
    : null;

  const newVLANPlaceholder = VLANFactory.build({ label: inputValue });

  const options = [...(vlans ?? [])];

  if (vlans?.length === 0 && inputValue && !isLoading) {
    options.push(newVLANPlaceholder);
  }

  const selectedOption = options.find(o => o.label === value) ?? null;

  return (
    <Autocomplete
      getOptionLabel={(option) => {
        if (option === newVLANPlaceholder) {
          return `Create "${option.label}"`;
        }
        return option.label;
      }}
      onInputChange={(_, value, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(value);
        }
      }}
      errorText={error?.[0]?.reason ?? errorText}
      filterOptions={(x) => x}
      fullWidth
      inputValue={selectedVLAN ? selectedVLAN.label : inputValue}
      isOptionEqualToValue={(o1, o2) => o1.label === o2.label}
      label="VLAN"
      loading={isLoading}
      onChange={(e, value) => onChange(value)}
      options={options}
      placeholder="Create or select a VLAN"
      textFieldProps={textFieldProps}
      value={selectedOption}
    />
  );
};
