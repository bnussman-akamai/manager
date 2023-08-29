import { Volume } from '@linode/api-v4';
import { UpdateVolumeSchema } from '@linode/validation';
import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { useUpdateVolumeMutation } from 'src/queries/volumes';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

interface Props {
  onClose: () => void;
  open: boolean;
  volume: Volume | undefined;
}

export const EditVolumeDrawer = (props: Props) => {
  const { onClose, open, volume } = props;

  const { mutateAsync: updateVolume } = useUpdateVolumeMutation();

  const readOnly = false;

  const {
    dirty,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    setFieldValue,
    status: error,
    touched,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: { label: volume?.label, tags: volume?.tags },
    onSubmit: (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
      setSubmitting(true);

      updateVolume({
        label: values.label ?? '',
        tags: values.tags,
        volumeId: volume?.id ?? -1,
      })
        .then(() => {
          resetForm();
          onClose();
        })
        .catch((errorResponse) => {
          setSubmitting(false);
          handleFieldErrors(setErrors, errorResponse);

          handleGeneralErrors(
            setStatus,
            errorResponse,
            `Unable to edit this Volume at this time. Please try again later.`
          );
        });
    },
    validationSchema: UpdateVolumeSchema,
  });

  return (
    <Drawer onClose={onClose} open={open} title="Edit Volume">
      <form onSubmit={handleSubmit}>
        {error && <Notice text={error} variant="error" />}
        <TextField
          errorText={errors.label}
          label="Label"
          name="label"
          onBlur={handleBlur}
          onChange={handleChange}
          required
          value={values.label}
        />
        <TagsInput
          onChange={(selected) =>
            setFieldValue(
              'tags',
              selected.map((item) => item.value)
            )
          }
          tagError={
            touched.tags
              ? errors.tags
                ? 'Unable to tag volume.'
                : undefined
              : undefined
          }
          label="Tags"
          name="tags"
          value={values.tags?.map((t) => ({ label: t, value: t })) ?? []}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: readOnly || !dirty,
            label: 'Save Changes',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: () => {
              resetForm();
              onClose();
            },
          }}
        />
      </form>
    </Drawer>
  );
};
