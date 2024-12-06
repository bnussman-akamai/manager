import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

export const MaskData = () => {
  const { data: maskPref } = usePreferences(
    (prefs) => prefs?.maskSensitiveData
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const isSensitiveDataMasked = maskPref === true;

  return (
    <Paper>
      <Typography marginBottom={1} variant="h2">
        Mask Sensitive Data
      </Typography>
      <Typography marginBottom={1} variant="body1">
        Mask IP addresses and user contact information for data privacy.
      </Typography>
      <FormControlLabel
        control={
          <Toggle
            onChange={(_, checked) =>
              updatePreferences({ maskSensitiveData: checked })
            }
            checked={isSensitiveDataMasked}
          />
        }
        label={`Sensitive data is ${
          isSensitiveDataMasked ? 'masked' : 'visible'
        }`}
      />
    </Paper>
  );
};
