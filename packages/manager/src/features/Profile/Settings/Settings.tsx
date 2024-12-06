import { FormControlLabel, Paper, Stack, Toggle, Typography } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useMutateProfile, useProfile } from 'src/queries/profile/profile';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import { MaskData } from './MaskData';
import { PreferenceEditor } from './PreferenceEditor';
import { Theme } from './Theme';
import { TypeToConfirm } from './TypeToConfirm';

export const ProfileSettings = () => {
  const location = useLocation();
  const history = useHistory();

  const preferenceEditorOpen = Boolean(
    getQueryParamFromQueryString(location.search, 'preferenceEditor')
  );

  const handleClosePreferenceEditor = () => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete('preferenceEditor');
    history.replace({ search: queryParams.toString() });
  };

  const { data: profile } = useProfile();
  const { isPending, mutateAsync: updateProfile } = useMutateProfile();

  // Email notifications and masking sensitive data are disabled by default until the user explicitly enables it.
  const areEmailNotificationsEnabled = profile?.email_notifications === true;

  return (
    <Stack spacing={2}>
      <DocumentTitleSegment segment="My Settings" />
      <Paper>
        <Typography marginBottom={1} variant="h2">
          Notifications
        </Typography>
        <FormControlLabel
          control={
            <Toggle
              onChange={(_, checked) =>
                updateProfile({
                  email_notifications: checked,
                })
              }
              checked={areEmailNotificationsEnabled}
            />
          }
          label={`Email alerts for account activity are ${
            areEmailNotificationsEnabled ? 'enabled' : 'disabled'
          }`}
          disabled={isPending}
        />
      </Paper>
      <Theme />
      <TypeToConfirm />
      <MaskData />
      <PreferenceEditor
        onClose={handleClosePreferenceEditor}
        open={preferenceEditorOpen}
      />
    </Stack>
  );
};


export const SettingsLazyRoute = createLazyRoute('/profile/settings')({
  component: ProfileSettings,
});
