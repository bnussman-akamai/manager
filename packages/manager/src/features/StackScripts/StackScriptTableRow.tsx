import React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

import { getStackScriptUrl } from './stackScriptUtils';

import type { StackScript } from '@linode/api-v4';

interface Props {
  stackscript: StackScript;
  type: 'account' | 'community';
}

export const StackScriptTableRow = (props: Props) => {
  const history = useHistory();

  const { stackscript, type } = props;
  const {
    deployments_total,
    description,
    id,
    images,
    is_public,
    label,
    updated,
    username,
  } = stackscript;

  const deployToLinodeURL = getStackScriptUrl(username, id);

  const actionMenuItems = [
    {
      onClick: () => alert('edit'),
      title: 'Edit',
    },
    {
      onClick: () => history.push(deployToLinodeURL),
      title: 'Deploy new Linode',
    },
    {
      onClick: () => alert('make public'),
      title: 'Make StackScript Public',
    },
    {
      onClick: () => alert('delete'),
      title: 'Delete',
    },
  ];

  if (username.startsWith('lke-service-account-') && label.includes('kube')) {
    return null;
  }

  return (
    <TableRow>
      <TableCell>
        <Typography>
          {username} / <Link to={`/stackscripts/${id}`}>{label}</Link>
        </Typography>
        <Typography
          sx={(theme) => ({
            color: theme.textColors.tableHeader,
            fontSize: '.75rem',
            maxWidth: 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}
          variant="body1"
        >
          {description}
        </Typography>
      </TableCell>
      <TableCell>{deployments_total}</TableCell>
      <TableCell noWrap>
        <DateTimeDisplay displayTime={false} value={updated} />
      </TableCell>
      <TableCell>
        {images?.map((image) => image?.split('linode/')[1]).join(', ')}
      </TableCell>
      {type === 'account' && (
        <TableCell>{is_public ? 'Public' : 'Private'}</TableCell>
      )}
      <TableCell actionCell sx={{ minWidth: 170 }}>
        {type === 'community' ? (
          <InlineMenuAction
            actionText="Deploy new Linode"
            onClick={() => history.push(deployToLinodeURL)}
          />
        ) : (
          <ActionMenu
            actionsList={actionMenuItems}
            ariaLabel={`Action menu for ${label}`}
          />
        )}
      </TableCell>
    </TableRow>
  );
};
