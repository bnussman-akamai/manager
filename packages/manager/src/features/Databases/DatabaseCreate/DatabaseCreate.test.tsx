import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { databaseTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { mockMatchMedia } from 'src/utilities/testHelpers';

import DatabaseCreate from './DatabaseCreate';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

describe('Database Create', () => {
  it('should render loading state', () => {
    const { getByTestId } = renderWithTheme(<DatabaseCreate />);
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render inputs', async () => {
    const { getAllByTestId, getAllByText } = renderWithTheme(
      <DatabaseCreate />
    );
    await waitForElementToBeRemoved(getAllByTestId(loadingTestId));

    getAllByText('Cluster Label');
    getAllByText('Database Engine');
    getAllByText('Region');
    getAllByText('Choose a Plan');
    getAllByTestId('database-nodes');
    getAllByTestId('domain-transfer-input');
    getAllByText('Create Database Cluster');
  });

  it('should display the correct node price and disable 3 nodes for 1 GB plans', async () => {
    const standardTypes = [
      databaseTypeFactory.build({
        class: 'nanode',
        id: 'g6-standard-0',
        label: `Nanode 1 GB`,
        memory: 1024,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'standard' }),
    ];
    const dedicatedTypes = databaseTypeFactory.buildList(7, {
      class: 'dedicated',
    });
    server.use(
      http.get('*/databases/types', () => {
        return HttpResponse.json(
          makeResourcePage([...standardTypes, ...dedicatedTypes])
        );
      })
    );


    const { getAllByText, getByTestId } = renderWithTheme(<DatabaseCreate />, {
      // Mock route history so the Plan Selection table displays prices without requiring a region in the DB Create flow.
      MemoryRouter: { initialEntries: ["/databases/create"] },
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // default to $0 if no plan is selected
    const nodeRadioBtns = getByTestId('database-nodes');
    expect(nodeRadioBtns).toHaveTextContent('$0/month $0/hr');

    // update node pricing if a plan is selected
    const radioBtn = getAllByText('Nanode 1 GB')[0];
    fireEvent.click(radioBtn);
    expect(nodeRadioBtns).toHaveTextContent('$60/month $0.09/hr');
    expect(nodeRadioBtns).toHaveTextContent('$140/month $0.21/hr');
  });
});
