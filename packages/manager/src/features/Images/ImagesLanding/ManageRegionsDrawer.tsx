import React, { useEffect, useMemo } from 'react';

import { Drawer } from 'src/components/Drawer';
import { RegionMultiSelect } from 'src/components/RegionSelect/RegionMultiSelect';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { Image, UpdateImageRegionsPayload } from '@linode/api-v4';
import { Controller, useForm } from 'react-hook-form';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { useUpdateImageRegionsMutation } from 'src/queries/images';

interface Props {
  image: Image | undefined;
  onClose: () => void;
  onOpenView: (image: Image) => void;
}

export const ManageRegionsDrawer = (props: Props) => {
  const { image, onClose, onOpenView } = props;
  const open = image !== undefined;

  const imageRegions = useMemo(
    () => image?.regions.map(({ region }) => region) ?? [],
    [image]
  );

  const { data: regions } = useRegionsQuery();

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateImageRegionsPayload>({
    defaultValues: { regions: imageRegions },
  });

  const { mutateAsync } = useUpdateImageRegionsMutation(image?.id ?? '');

  const onSubmit = async (values: UpdateImageRegionsPayload) =>  {
    try {
      await mutateAsync(values);

      onOpenView(image!);
    } catch (errors) {
      // ... 
    }
  };

  useEffect(() => {
    reset({ regions: imageRegions });
  }, [imageRegions]);

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Manage Regions for ${image?.id}`}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography></Typography>
        <Controller
          render={({ field, fieldState }) => (
            <RegionMultiSelect
              currentCapability={undefined}
              errorText={fieldState.error?.message}
              onChange={field.onChange}
              regions={regions ?? []}
              selectedIds={field.value}
            />
          )}
          control={control}
          name="regions"
        />
        <ActionsPanel
          primaryButtonProps={{
            label: 'Save',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
