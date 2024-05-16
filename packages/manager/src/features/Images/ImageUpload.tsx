import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Checkbox } from 'src/components/Checkbox';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { LinodeCLIModal } from 'src/components/LinodeCLIModal/LinodeCLIModal';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Prompt } from 'src/components/Prompt/Prompt';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { ImageUploader } from 'src/components/Uploaders/ImageUploader/ImageUploader';
import { Dispatch } from 'src/hooks/types';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useFlags } from 'src/hooks/useFlags';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/account/agreements';
import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { setPendingUpload } from 'src/store/pendingUpload';
import { getErrorMap } from 'src/utilities/errorUtils';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import { wrapInQuotes } from 'src/utilities/stringUtils';

import { EUAgreementCheckbox } from '../Account/Agreements/EUAgreementCheckbox';

import type { ImageUploadPayload } from '@linode/api-v4';

export const ImageUpload = () => {
  const { location } = useHistory<{
    imageDescription: string;
    imageLabel?: string;
  }>();

  const form = useForm<ImageUploadPayload>({
    defaultValues: {
      description: location.state.imageDescription,
      label: location.state.imageLabel,
    },
  });

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: agreements } = useAccountAgreements();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();

  const regions = useRegionsQuery().data ?? [];
  const dispatch: Dispatch = useDispatch();
  const { push } = useHistory();
  const flags = useFlags();

  const [hasSignedAgreement, setHasSignedAgreement] = React.useState<boolean>(
    false
  );

  const [region, setRegion] = React.useState<string>('');
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [linodeCLIModalOpen, setLinodeCLIModalOpen] = React.useState<boolean>(
    false
  );

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions,
    selectedRegionId: region,
  });

  //  This holds a "cancel function" from the Axios instance that handles image
  // uploads. Calling this function will cancel the HTTP request.
  const [cancelFn, setCancelFn] = React.useState<(() => void) | null>(null);

  // Whether or not there is an upload pending. This is stored in Redux since
  // high-level components like AuthenticationWrapper need to read it.
  const pendingUpload = useSelector<ApplicationState, boolean>(
    (state) => state.pendingUpload
  );

  // Keep track of the session token since we may need to grab the user a new
  // one after a long upload (if their session has expired).
  const currentToken = useCurrentToken();

  const canCreateImage =
    Boolean(!profile?.restricted) || Boolean(grants?.global?.add_images);

  // Called after a user confirms they want to navigate to another part of
  // Cloud during a pending upload. When we have refresh tokens this won't be
  // necessary; the user will be able to navigate to other components and we
  // will show the upload progress in the lower part of the screen. For now we
  // box the user on this page so we can handle token expiry (semi)-gracefully.
  const onConfirm = (nextLocation: string) => {
    if (cancelFn) {
      cancelFn();
    }

    dispatch(setPendingUpload(false));

    // If the user's session has expired we need to send them to Login to get
    // a new token. They will be redirected back to path they were trying to
    // reach.
    if (!currentToken) {
      redirectToLogin(nextLocation);
    } else {
      push(nextLocation);
    }
  };

  const onSuccess = () => {
    if (hasSignedAgreement) {
      updateAccountAgreements({
        eu_model: true,
        privacy_policy: true,
      }).catch(reportAgreementSigningError);
    }
  };

  const uploadingDisabled =
    !label ||
    !region ||
    !canCreateImage ||
    (showGDPRCheckbox && !hasSignedAgreement);

  const errorMap = getErrorMap(['label', 'description', 'region'], errors);

  const cliLabel = formatForCLI(label, 'label');
  const cliDescription = formatForCLI(description, 'description');
  const cliRegion = formatForCLI(region, 'region');
  const linodeCLICommand = `linode-cli image-upload --label ${cliLabel} --description ${cliDescription} --region ${cliRegion} FILE`;

  return (
    <>
      <Prompt
        confirmWhenLeaving={true}
        onConfirm={onConfirm}
        when={pendingUpload}
      >
        {({ handleCancel, handleConfirm, isModalOpen }) => {
          return (
            <ConfirmationDialog
              actions={() => (
                <ActionsPanel
                  primaryButtonProps={{
                    label: 'Leave Page',
                    onClick: handleConfirm,
                  }}
                  secondaryButtonProps={{
                    label: 'Cancel',
                    onClick: handleCancel,
                  }}
                />
              )}
              onClose={handleCancel}
              open={isModalOpen}
              title="Leave this page?"
            >
              <Typography variant="subtitle1">
                An upload is in progress. If you navigate away from this page,
                the upload will be canceled.
              </Typography>
            </ConfirmationDialog>
          );
        }}
      </Prompt>
      <Paper>
        {errorMap.none ? <Notice text={errorMap.none} variant="error" /> : null}
        {!canCreateImage && (
          <Notice
            text="You don't have permissions to create a new Image. Please contact an account administrator for details."
            variant="error"
          />
        )}
        <TextField
          disabled={!canCreateImage}
          errorText={errorMap.label}
          label="Label"
          onChange={changeLabel}
          required
          value={label}
        />
        <TextField
          disabled={!canCreateImage}
          errorText={errorMap.description}
          label="Description"
          multiline
          onChange={changeDescription}
          rows={1}
          value={description}
        />
        {flags.metadata && (
          <Checkbox
            toolTipText={
              <Typography>
                Only check this box if your Custom Image is compatible with
                cloud-init, or has cloud-init installed, and the config has been
                changed to use our data service.{' '}
                <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata-cloud-config/">
                  Learn how.
                </Link>
              </Typography>
            }
            checked={isCloudInit}
            onChange={changeIsCloudInit}
            text="This image is cloud-init compatible"
            toolTipInteractive
          />
        )}
        <RegionSelect
          helperText="For fastest initial upload, select the region that is geographically
            closest to you. Once uploaded you will be able to deploy the image
            to other regions."
          currentCapability={undefined}
          disabled={!canCreateImage}
          errorText={errorMap.region}
          handleSelection={setRegion}
          label="Region"
          regionFilter="core" // Images service will not be supported for Gecko Beta
          regions={regions}
          required
          selectedId={region}
        />
        {showGDPRCheckbox && (
          <EUAgreementCheckbox
            centerCheckbox
            checked={hasSignedAgreement}
            onChange={(e) => setHasSignedAgreement(e.target.checked)}
          />
        )}
        <Notice spacingTop={24} sx={{ fontSize: '0.875rem' }} variant="warning">
          <Typography>
            Image files must be raw disk images (.img) compressed using gzip
            (.gz). The maximum file size is 5 GB (compressed) and maximum image
            size is 6 GB (uncompressed).
          </Typography>
        </Notice>
        <Typography>
          Custom Images are billed at $0.10/GB per month based on the
          uncompressed image size.
        </Typography>
        <ImageUploader
          apiError={errorMap.none} // Any errors that aren't related to 'label', 'description', or 'region' fields
          description={description}
          dropzoneDisabled={uploadingDisabled}
          isCloudInit={isCloudInit}
          label={label}
          onSuccess={onSuccess}
          region={region}
          setCancelFn={setCancelFn}
          setErrors={setErrors}
        />
        <Typography sx={{ paddingBottom: 1, paddingTop: 2 }}>
          Or, upload an image using the{' '}
          <LinkButton onClick={() => setLinodeCLIModalOpen(true)}>
            Linode CLI
          </LinkButton>
          . For more information, please see{' '}
          <Link to="https://www.linode.com/docs/guides/linode-cli">
            our guide on using the Linode CLI
          </Link>
          .
        </Typography>
      </Paper>
      <LinodeCLIModal
        analyticsKey="Image Upload"
        command={linodeCLICommand}
        isOpen={linodeCLIModalOpen}
        onClose={() => setLinodeCLIModalOpen(false)}
      />
    </>
  );
};

const formatForCLI = (value: string, fallback: string) => {
  return value ? wrapInQuotes(value) : `[${fallback.toUpperCase()}]`;
};
