import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { Divider } from 'src/components/Divider';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { IconButton } from 'src/components/IconButton';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { VPCSelect } from 'src/components/VPCSelect';
import { VPC_AUTO_ASSIGN_IPV4_TOOLTIP } from 'src/features/VPCs/constants';
import { useVPCQuery } from 'src/queries/vpcs';

import { VPCCreateDrawer } from '../LinodesCreate/VPCCreateDrawer';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const VPC = () => {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const {
    control,
    formState,
    setValue,
  } = useFormContext<CreateLinodeRequest>();

  const [
    regionId,
    selectedVPCId,
    selectedSubnetId,
    linodeVPCIPAddress,
  ] = useWatch({
    control,
    name: [
      'region',
      'interfaces.2.vpc_id',
      'interfaces.2.subnet_id',
      'interfaces.2.ipv4.vpc',
    ],
  });

  const { data: selectedVPC } = useVPCQuery(
    selectedVPCId ?? -1,
    Boolean(selectedVPCId)
  );

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">VPC</Typography>
        <Typography>
          Assign this Linode to an existing VPC.{' '}
          <Link to="https://www.linode.com/docs/products/networking/vpc/guides/assign-services/">
            Learn more.
          </Link>
        </Typography>
        <Stack spacing={1.5}>
          <Controller
            render={({ field, fieldState }) => (
              <VPCSelect
                errorText={fieldState.error?.message}
                filter={{ region: regionId }}
                label="Assign VPC"
                noMarginTop
                onChange={(e, vpc) => field.onChange(vpc?.id ?? null)}
                placeholder="None"
                value={field.value ?? null}
              />
            )}
            control={control}
            name="interfaces.2.vpc_id"
          />
          <Box>
            <LinkButton onClick={() => setIsCreateDrawerOpen(true)}>
              Create VPC
            </LinkButton>
          </Box>
          {selectedVPCId && (
            <>
              <Controller
                render={({ field, fieldState }) => (
                  <Autocomplete
                    getOptionLabel={(subnet) =>
                      `${subnet.label} (${subnet.ipv4})`
                    }
                    value={
                      selectedVPC?.subnets.find(
                        (subnet) => subnet.id === field.value
                      ) ?? null
                    }
                    errorText={fieldState.error?.message}
                    label="Subnet"
                    noMarginTop
                    onChange={(e, subnet) => field.onChange(subnet?.id ?? null)}
                    options={selectedVPC?.subnets ?? []}
                    placeholder="Select Subnet"
                  />
                )}
                control={control}
                name="interfaces.2.subnet_id"
              />
              {selectedSubnetId && (
                <>
                  <Controller
                    render={({ field }) => (
                      <FormControlLabel
                        checked={
                          field.value === null || field.value === undefined
                        }
                        label={
                          <Stack alignItems="center" direction="row">
                            <Typography>
                              Auto-assign a VPC IPv4 address for this Linode in
                              the VPC
                            </Typography>
                            <TooltipIcon
                              status="help"
                              text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP}
                            />
                          </Stack>
                        }
                        onChange={(e, checked) =>
                          field.onChange(checked ? null : '')
                        }
                        control={<Checkbox sx={{ ml: -1 }} />}
                      />
                    )}
                    control={control}
                    name="interfaces.2.ipv4.vpc"
                  />
                  {linodeVPCIPAddress !== null &&
                    linodeVPCIPAddress !== undefined && (
                      <Controller
                        render={({ field, fieldState }) => (
                          <TextField
                            errorText={fieldState.error?.message}
                            label="VPC IPv4"
                            noMarginTop
                            onChange={field.onChange}
                            required
                            value={field.value}
                          />
                        )}
                        control={control}
                        name="interfaces.2.ipv4.vpc"
                      />
                    )}
                  <Controller
                    render={({ field }) => (
                      <FormControlLabel
                        label={
                          <Stack alignItems="center" direction="row">
                            <Typography>
                              Assign a public IPv4 address for this Linode
                            </Typography>
                            <TooltipIcon
                              text={
                                'Access the internet through the public IPv4 address using static 1:1 NAT.'
                              }
                              status="help"
                            />
                          </Stack>
                        }
                        onChange={(e, checked) =>
                          field.onChange(checked ? 'any' : null)
                        }
                        checked={field.value === 'any'}
                        control={<Checkbox sx={{ ml: -1 }} />}
                        sx={{ mt: 0 }}
                      />
                    )}
                    control={control}
                    name="interfaces.2.ipv4.nat_1_1"
                  />
                  <Divider />
                  <Typography variant="h3">
                    Assign additional IPv4 ranges
                  </Typography>
                  {formState.errors.interfaces?.[1]?.ip_ranges?.message && (
                    <Notice
                      text={formState.errors.interfaces[1]?.ip_ranges?.message}
                      variant="error"
                    />
                  )}
                  <Typography>
                    Assign additional IPv4 address ranges that the VPC can use
                    to reach services running on this Linode.{' '}
                    <Link to="https://www.linode.com/docs/products/networking/vpc/guides/assign-services/">
                      Learn more
                    </Link>
                    .
                  </Typography>
                  <VPCRanges />
                </>
              )}
            </>
          )}
        </Stack>
      </Stack>
      <VPCCreateDrawer
        handleSelectVPC={(vpcId) => setValue('interfaces.1.vpc_id', vpcId)}
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
        selectedRegion={regionId}
      />
    </Paper>
  );
};

const VPCRanges = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'interfaces.2.ip_ranges',
  });

  return (
    <Stack spacing={1}>
      <Stack>
        {fields.map((field, index) => (
          <Stack alignItems="center" direction="row" key={field.id}>
            <Controller
              render={({ field }) => (
                <TextField
                  hideLabel
                  label={`IP Range ${index}`}
                  onChange={field.onChange}
                  placeholder="10.0.0.0/24"
                  value={field.value}
                />
              )}
              control={control}
              name={`interfaces.2.ip_ranges.${index}`}
            />
            <IconButton
              aria-label={`Remove IP Range ${index}`}
              onClick={() => remove(index)}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Box>
        <LinkButton onClick={() => append('')}>Add IPv4 Range</LinkButton>
      </Box>
    </Stack>
  );
};