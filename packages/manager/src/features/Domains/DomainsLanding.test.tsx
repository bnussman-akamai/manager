import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DomainsLanding } from './DomainsLanding';

describe('Domains Landing', () => {
  it('should initially render a loading state', async () => {
    const { getByTestId } = renderWithTheme(<DomainsLanding />, {
      initialRoute: '/domains',
    });
    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });
});
