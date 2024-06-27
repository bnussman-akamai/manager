import React from 'react';

import { Box } from 'src/components/Box';
import { Drawer } from 'src/components/Drawer';
import { LinkButton } from 'src/components/LinkButton';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Typography } from 'src/components/Typography';

import { ImageRegionRow } from './ImageRegionRow';

import type { Image } from '@linode/api-v4';

interface Props {
  image: Image | undefined;
  onClose: () => void;
  onOpenManageRegions: (image: Image) => void;
}

export const ViewImageDrawer = (props: Props) => {
  const { image, onClose, onOpenManageRegions } = props;
  const open = image !== undefined;

  return (
    <Drawer onClose={onClose} open={open} title={`Image ${image?.id}`}>
      <Stack spacing={1}>
        <Box display="flex" justifyContent="space-between">
          <Typography fontFamily={(theme) => theme.font.bold}>ID</Typography>
          <Typography>{image?.id}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography fontFamily={(theme) => theme.font.bold}>Label</Typography>
          <Typography>{image?.label}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography fontFamily={(theme) => theme.font.bold}>
            Status
          </Typography>
          <Stack alignItems="center" direction="row" gap={1}>
            <Typography textTransform="capitalize">{image?.status}</Typography>
            <StatusIcon status="active" sx={{ mr: 0 }} />
          </Stack>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography fontFamily={(theme) => theme.font.bold}>Size</Typography>
          <Typography>{image?.size} MB</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography fontFamily={(theme) => theme.font.bold}>
            Total Size
          </Typography>
          <Typography>{image?.total_size} MB</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography fontFamily={(theme) => theme.font.bold}>
            Created
          </Typography>
          <Typography>{image?.created}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography fontFamily={(theme) => theme.font.bold}>
            Created By
          </Typography>
          <Typography>{image?.created_by}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography fontFamily={(theme) => theme.font.bold}>
            Capabilities
          </Typography>
          <Typography>
            {image?.capabilities.length === 0
              ? 'N/A'
              : image?.capabilities.join(', ')}
          </Typography>
        </Box>
        <Stack pt={4} spacing={1}>
          <Box display="flex" justifyContent="space-between">
            <Typography fontFamily={(theme) => theme.font.bold}>
              Regions
            </Typography>
            <LinkButton onClick={() => onOpenManageRegions(image!)}>
              Manage Regions
            </LinkButton>
          </Box>
          <Paper
            sx={(theme) => ({
              backgroundColor: theme.palette.grey[900],
              gap: 2,
              p: 2,
              py: 1,
            })}
          >
            <Stack gap={1.5}>
              {image?.regions.map(({ region, status }) => (
                <ImageRegionRow key={region} region={region} status={status} />
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </Drawer>
  );
};
