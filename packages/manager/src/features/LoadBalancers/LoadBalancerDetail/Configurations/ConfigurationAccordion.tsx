import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Accordion } from 'src/components/Accordion';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import Select from 'src/components/EnhancedSelect/Select';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { pluralize } from 'src/utilities/pluralize';

import { ApplyCertificatesDrawer } from './ApplyCertificatesDrawer';
import { CertificateTable } from './CertificateTable';

import type { Configuration } from '@linode/api-v4';

interface Props {
  configuration: Configuration;
  loadbalancerId: number;
}

export const ConfigurationAccordion = (props: Props) => {
  const { configuration, loadbalancerId } = props;
  const [isApplyCertDialogOpen, setIsApplyCertDialogOpen] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: configuration,
    onSubmit(values) {
      alert(JSON.stringify(values, null, 2));
    },
  });

  const protocolOptions = [
    { label: 'HTTPS', value: 'https' },
    { label: 'HTTP', value: 'http' },
    { label: 'TCP', value: 'tcp' },
  ];

  const handleRemoveCert = (index: number) => {
    formik.values.certificates.splice(index, 1);
    formik.setFieldValue('certificates', formik.values.certificates);
  };

  const handleAddCerts = (certificates: Configuration['certificates']) => {
    formik.setFieldValue('certificates', [
      ...formik.values.certificates,
      ...certificates,
    ]);
  };

  return (
    <Accordion
      heading={
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          gap={1}
          justifyContent="space-between"
          pr={2}
        >
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography variant="h3">{configuration.label}</Typography>
            <Typography>&mdash;</Typography>
            <Typography fontSize="1rem">
              Port {configuration.port} -{' '}
              {pluralize('Route', 'Routes', configuration.routes.length)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Typography>Endpoints:</Typography>
              <StatusIcon status="active" />
              <Typography>4 up</Typography>
              <Typography>&mdash;</Typography>
              <StatusIcon status="error" />
              <Typography>6 down</Typography>
            </Stack>
            <Box>
              <Typography>ID: {configuration.id}</Typography>
            </Box>
          </Stack>
        </Stack>
      }
      headingProps={{ sx: { width: '100%' } }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h2">Details</Typography>
        <TextField
          label="Configuration Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Select
              value={
                protocolOptions.find(
                  (option) => option.value === formik.values.protocol
                ) ?? null
              }
              isClearable={false}
              label="Protocol"
              onChange={({ value }) => formik.setFieldValue('protocol', value)}
              options={protocolOptions}
              styles={{ container: () => ({ width: 'unset' }) }}
            />
            <TextField
              label="Port"
              name="port"
              onChange={formik.handleChange}
              value={formik.values.port}
            />
          </Stack>
          <Stack maxWidth="600px">
            <Stack alignItems="center" direction="row">
              <Typography fontWeight="bold">TLS Certificates</Typography>
              <TooltipIcon status="help" text="OMG!" />
              <Box flexGrow={1} />
              <Button>Upload Certificate</Button>
            </Stack>
            <CertificateTable
              certificates={formik.values.certificates}
              onRemove={handleRemoveCert}
            />
            <Box mt={2}>
              <Button
                buttonType="outlined"
                onClick={() => setIsApplyCertDialogOpen(true)}
              >
                Apply {configuration.certificates.length > 0 ? 'More' : ''}{' '}
                Certificates
              </Button>
            </Box>
          </Stack>
        </Stack>
        <Divider spacingBottom={16} spacingTop={16} />
        <Stack spacing={2}>
          <Typography variant="h2">Routes</Typography>
        </Stack>
        <ApplyCertificatesDrawer
          loadbalancerId={loadbalancerId}
          onAdd={handleAddCerts}
          onClose={() => setIsApplyCertDialogOpen(false)}
          open={isApplyCertDialogOpen}
        />
      </form>
    </Accordion>
  );
};
