import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Accordion } from 'src/components/Accordion';
import { Link } from 'src/components/Link';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { VLANSelect } from 'src/components/VLANSelect';

import { defaultPublicInterface } from '../LinodesCreate/LinodeCreate';
import { VLANAvailabilityNotice } from '../LinodesCreate/VLANAvailabilityNotice';

import type { CreateLinodeRequest, VLAN as VLANType } from '@linode/api-v4';

export const VLAN = () => {
  const { control, setValue, formState } = useFormContext<CreateLinodeRequest>();

  const interfaces = useWatch({ control, name: 'interfaces' });

  const vlanInterfaceIndex =
    interfaces?.findIndex((i) => i.purpose === 'vlan') ?? -1;

  const selectedVLAN =
    vlanInterfaceIndex !== -1 && interfaces
      ? interfaces[vlanInterfaceIndex]
      : null;

  const handleVLANSelect = (vlan: VLANType | null) => {
    if (vlan === null) {
      setValue(
        'interfaces',
        interfaces?.filter((i) => i.purpose !== 'vlan')
      );
      return;
    }

    const newVlanInterface = {
      ipam_address: '',
      label: vlan.label,
      purpose: 'vlan',
    } as const;

    const newInterfaceArray = interfaces ? [...interfaces] : [];

    if (selectedVLAN) {
      newInterfaceArray[vlanInterfaceIndex] = newVlanInterface;
    } else {
      if (interfaces?.some((i) => i.purpose === 'public')) {
        newInterfaceArray.push(newVlanInterface);
      } else {
        newInterfaceArray.push(defaultPublicInterface);
        newInterfaceArray.push(newVlanInterface);
      }
    }

    setValue('interfaces', newInterfaceArray);
  };

  const handleIPAMChange = (value: string) => {
    if (!selectedVLAN) {
      const newVlanInterface = {
        ipam_address: value,
        label: '',
        purpose: 'vlan',
      } as const;

      const newInterfaceArray = interfaces ? [...interfaces] : [];

      if (interfaces?.some((i) => i.purpose === 'public')) {
        newInterfaceArray.push(newVlanInterface);
      } else {
        newInterfaceArray.push(defaultPublicInterface);
        newInterfaceArray.push(newVlanInterface);
      }

      return setValue('interfaces', newInterfaceArray);
    } else {
      const newInterfaceArray = interfaces ? [...interfaces] : [];

      newInterfaceArray[vlanInterfaceIndex] = {
        ...selectedVLAN,
        ipam_address: value,
      };

      return setValue('interfaces', newInterfaceArray);
    }
  };

  return (
    <Accordion heading="VLAN" sx={{ margin: '0 !important', p: 1 }}>
      <VLANAvailabilityNotice />
      <Typography variant="body1">
        VLANs are used to create a private L2 Virtual Local Area Network between
        Linodes. A VLAN created or attached in this section will be assigned to
        the eth1 interface, with eth0 being used for connections to the public
        internet. VLAN configurations can be further edited in the
        Linode&rsquo;s{' '}
        <Link to="https://www.linode.com/docs/guides/linode-configuration-profiles/">
          Configuration Profile
        </Link>
        .
      </Typography>
      <Stack columnGap={2} direction="row" flexWrap="wrap">
        <VLANSelect
          errorText={
            formState.errors.interfaces?.[vlanInterfaceIndex]?.label?.message
          }
          onChange={handleVLANSelect}
          value={selectedVLAN?.label ?? null}
        />
        <TextField
          errorText={
            formState.errors.interfaces?.[vlanInterfaceIndex]?.ipam_address
              ?.message
          }
          label="IPAM Address"
          onChange={(e) => handleIPAMChange(e.target.value)}
          optional
          placeholder="192.0.2.0/24"
          sx={{ minWidth: 300 }}
          value={selectedVLAN?.ipam_address ?? ''}
        />
      </Stack>
    </Accordion>
  );
};
