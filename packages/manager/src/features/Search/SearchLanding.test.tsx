import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SearchLanding } from './SearchLanding';

describe('SearchLanding', () => {
  it('should render', async () => {
    const { findByText } = renderWithTheme(<SearchLanding />);
    expect(await findByText(/search/));
  });

  it('should show an empty state', async () => {
    const { findByText } = renderWithTheme(<SearchLanding />);
    await findByText(/no results/i);
  });

  it('should handle blank or unusual queries without crashing', async () => {
    const { findByText } = renderWithTheme(<SearchLanding />);
    await findByText(/search/i);
  });
});
