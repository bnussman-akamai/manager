import { useTypeQuery } from '@linode/queries';
import { Hidden } from '@linode/ui';
import { formatStorageUnits } from '@linode/utilities';
import * as React from 'react';

import { BackupStatus } from 'src/components/BackupStatus/BackupStatus';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenu';

import { IPAddress } from '../IPAddress';
import { RegionIndicator } from '../RegionIndicator';
import { StyledIpTableCell } from './LinodeRow.styles';
import { LinodeStatus } from './LinodeStatus';

import type { LinodeHandlers } from '../LinodesLanding';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';

interface Props extends LinodeWithMaintenance {
  handlers: LinodeHandlers;
}

export const LinodeRow = (props: Props) => {
  const { backups, handlers, id, ipv4, label, region, status, type } = props;

  const { data: linodeType } = useTypeQuery(type ?? '', type !== null);

  const isBareMetalInstance = linodeType?.class === 'metal';

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <TableRow
      data-qa-linode={label}
      data-qa-loading
      key={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TableCell noWrap>
        <Link tabIndex={0} to={`/linodes/${id}`}>
          {label}
        </Link>
      </TableCell>
      <TableCell data-qa-status>
        <LinodeStatus id={id} status={status} /> 
      </TableCell>
      <Hidden smDown>
        <TableCell noWrap>
          {linodeType ? formatStorageUnits(linodeType.label) : type}
        </TableCell>
        <StyledIpTableCell data-qa-ips>
          <IPAddress ips={ipv4} isHovered={isHovered} />
        </StyledIpTableCell>
        <Hidden lgDown>
          <TableCell data-qa-region>
            <RegionIndicator region={region} />
          </TableCell>
        </Hidden>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          <BackupStatus
            backupsEnabled={backups.enabled}
            isBareMetalInstance={isBareMetalInstance}
            linodeId={id}
            mostRecentBackup={backups.last_successful}
          />
        </TableCell>
      </Hidden>
      <TableCell actionCell data-qa-notifications>
        <LinodeActionMenu
          linodeBackups={backups}
          linodeId={id}
          linodeLabel={label}
          linodeRegion={region}
          linodeStatus={status}
          linodeType={linodeType}
          {...handlers}
          inListView
        />
      </TableCell>
    </TableRow>
  );
};
