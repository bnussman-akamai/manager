import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it } from 'vitest';

import { subnetFactory, vpcFactory } from 'src/factories';
import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseNetworkingUnassignVPCDialog } from './DatabaseNetworkingUnassignVPCDialog';

describe('DatabaseNetworkingUnassignVPCDialog Component', () => {
  it(`should navigate to summary after unassigning`, async () => {
    const subnet = subnetFactory.build({ id: 1 });
    const vpc = vpcFactory.build({ id: 12345 });
    const database = databaseFactory.build({
      platform: 'rdbms-default',
      private_network: {
        vpc_id: vpc.id,
        subnet_id: subnet.id,
        public_access: false,
      },
      engine: 'mysql',
      id: 1,
    });

    const props = {
      databaseEngine: database.engine,
      databaseId: database.id,
      databaseLabel: database.label,
      onClose: vi.fn(),
      open: true,
    };

    const { findByTestId, router } = renderWithTheme(
      <DatabaseNetworkingUnassignVPCDialog {...props} />,
      {
        routerOptions: {
          initialRoute: '/databases/$engine/$databaseId/networking',
          useFullRouter: true,
        },
        MemoryRouter: {
          initialEntries: [
            `/databases/${database.engine}/${database.id}/networking`,
          ],
        },
      }
    );

    const unassignButton = await findByTestId('unassign-button');
    await userEvent.click(unassignButton);

    // Check that navigation occurs after unassign button is clicked
    await waitFor(() => {
      expect(router.state.location.searchStr).toBe(
        `/databases/${database.engine}/${database.id}`
      );
    });
  });
});
