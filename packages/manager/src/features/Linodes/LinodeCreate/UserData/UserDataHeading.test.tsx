import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDataHeading } from './UserDataHeading';

describe('UserDataHeading', () => {
  it('should display a warning in the header for cloning', async () => {
    const { getByText } = renderWithTheme(<UserDataHeading />, {
      routerOptions: {
        initialRoute: '/linodes/create',
      },
      MemoryRouter: {
        initialEntries: ['/linodes/create?type=Clone%20Linode'],
      },
    });

    expect(
      getByText(
        'Existing user data is not cloned. You may add new user data now.'
      )
    ).toBeVisible();
  });

  it('should display a warning in the header for creating from a Linode backup', async () => {
    const { getByText } = renderWithTheme(<UserDataHeading />, {
      routerOptions: {
        initialRoute: '/linodes/create',
      },
      MemoryRouter: {
        initialEntries: ['/linodes/create?type=Backups'],
      },
    });

    expect(
      getByText(
        'Existing user data is not accessible when creating a Linode from a backup. You may add new user data now.'
      )
    ).toBeVisible();
  });
});
