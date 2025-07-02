import { grantsFactory, profileFactory } from '@linode/utilities';
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import ImagesLanding from './ImagesLanding';

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';

describe('Images Landing Table', () => {
  it('should render images landing table with items', async () => {
    server.use(
      http.get('*/images', () => {
        const images = imageFactory.buildList(3, {
          regions: [
            { region: 'us-east', status: 'available' },
            { region: 'us-southeast', status: 'pending' },
          ],
        });
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { getAllByText, queryByTestId } = renderWithTheme(<ImagesLanding />, {
      routerOptions: { initialRoute: '/images' },
    });

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    // Two tables should render
    getAllByText('Custom Images');
    getAllByText('Recovery Images');

    // Static text and table column headers
    expect(getAllByText('Image').length).toBe(2);
    expect(getAllByText('Status').length).toBe(2);
    expect(getAllByText('Replicated in').length).toBe(1);
    expect(getAllByText('Original Image').length).toBe(1);
    expect(getAllByText('All Replicas').length).toBe(1);
    expect(getAllByText('Created').length).toBe(2);
    expect(getAllByText('Image ID').length).toBe(1);
  });

  it('should render custom images empty state', async () => {
    server.use(
      http.get('*/images', ({ request }) => {
        return HttpResponse.json(
          makeResourcePage(
            request.headers.get('x-filter')?.includes('automatic')
              ? [imageFactory.build({ type: 'automatic' })]
              : []
          )
        );
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(<ImagesLanding />, {
      routerOptions: { initialRoute: '/images' },
    });

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    expect(getByText('No Custom Images to display.')).toBeInTheDocument();
  });

  it('should render automatic images empty state', async () => {
    server.use(
      http.get('*/images', ({ request }) => {
        return HttpResponse.json(
          makeResourcePage(
            request.headers.get('x-filter')?.includes('manual')
              ? [imageFactory.build({ type: 'manual' })]
              : []
          )
        );
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(<ImagesLanding />, {
      routerOptions: { initialRoute: '/images' },
    });

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    expect(getByText('No Recovery Images to display.')).toBeInTheDocument();
  });

  it('should render images landing empty state', async () => {
    server.use(
      http.get('*/images', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(<ImagesLanding />, {
      routerOptions: { initialRoute: '/images' },
    });

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    expect(
      getByText((text) => text.includes('Store custom Linux images'))
    ).toBeInTheDocument();
  });

  it('should allow opening the Edit Image drawer', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });
    server.use(
      http.get('*/images', ({ request }) => {
        const filter = request.headers.get('x-filter');

        if (filter?.includes('manual')) {
          return HttpResponse.json(makeResourcePage(images));
        }
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { findByLabelText, getByText, findByText } = renderWithTheme(
      <ImagesLanding />,
      {
        routerOptions: {
          initialRoute: '/images',
          useFullRouter: true,
        },
      }
    );

    // The only catch with using the full router is that we must await the expected UI
    // because our full router has lazy (async) routes that are suspended.
    const actionMenu = await findByLabelText(
      `Action menu for Image ${images[0].label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Edit'));

    expect(await findByText('Edit Image')).toBeVisible();
  });

  it('should allow opening the Restore Image drawer', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });

    server.use(
      http.get('*/images', ({ request }) => {
        const filter = request.headers.get('x-filter');

        if (filter?.includes('manual')) {
          return HttpResponse.json(makeResourcePage(images));
        }
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { findByLabelText, getByText } = renderWithTheme(<ImagesLanding />, {
      routerOptions: { initialRoute: '/images', useFullRouter: true },
    });

    const actionMenu = await findByLabelText(
      `Action menu for Image ${images[0].label}`
    );

    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Rebuild an Existing Linode'));

    await waitFor(() => {
      getByText('Rebuild an Existing Linode from an Image');
    });
  });

  it('should allow deploying to a new Linode', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });

    server.use(
      http.get('*/images', ({ request }) => {
        const filter = request.headers.get('x-filter');

        if (filter?.includes('manual')) {
          return HttpResponse.json(makeResourcePage(images));
        }
        return HttpResponse.json(makeResourcePage([]));
      })
    );
    const { findByLabelText, getByText, router } = renderWithTheme(
      <ImagesLanding />,
      {
        routerOptions: { initialRoute: '/images', useFullRouter: true },
      }
    );

    const actionMenu = await findByLabelText(
      `Action menu for Image ${images[0].label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Deploy to New Linode'));

    // We can access the router and asset based on its state
    expect(router.state.location.pathname).toBe('/linodes/create');
    expect(router.state.location.searchStr).toBe(
      `?type=Images&imageID=${encodeURIComponent(images[0].id)}`
    );
  });

  it('should allow deleting an image', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });

    server.use(
      http.get('*/images', ({ request }) => {
        const filter = request.headers.get('x-filter');

        if (filter?.includes('manual')) {
          return HttpResponse.json(makeResourcePage(images));
        }
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, findByLabelText } = renderWithTheme(<ImagesLanding />, {
      routerOptions: { initialRoute: '/images', useFullRouter: true },
    });

    const actionMenu = await findByLabelText(
      `Action menu for Image ${images[0].label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Delete'));

    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete this Image?')
      ).toBeVisible();
    });
  });

  it('disables the create button if the user does not have permission to create images', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });
    server.use(
      http.get('*/v4/profile', () => {
        const profile = profileFactory.build({ restricted: true });
        return HttpResponse.json(profile);
      }),
      http.get('*/v4/profile/grants', () => {
        const grants = grantsFactory.build({ global: { add_images: false } });
        return HttpResponse.json(grants);
      }),
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(<ImagesLanding />, {
      routerOptions: { initialRoute: '/images' },
    });

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    const createImageButton = getByText('Create Image').closest('button');

    expect(createImageButton).toBeDisabled();
    expect(createImageButton).toHaveAttribute(
      'data-qa-tooltip',
      "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
    );
  });

  it('disables the action menu buttons if user does not have permissions to edit images', async () => {
    const images = imageFactory.buildList(1, {
      id: 'private/99999',
      label: 'vi-test-image',
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });

    server.use(
      http.get('*/v4/profile', () => {
        const profile = profileFactory.build({ restricted: true });
        return HttpResponse.json(profile);
      }),
      http.get('*/v4/profile/grants', () => {
        const grants = grantsFactory.build({
          global: {
            add_linodes: false,
          },
          image: [
            {
              id: 99999,
              label: 'vi-test-image',
              permissions: 'read_only',
            },
          ],
        });
        return HttpResponse.json(grants);
      }),
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { findAllByLabelText, getAllByLabelText, queryByTestId } =
      renderWithTheme(<ImagesLanding />, {
        routerOptions: { initialRoute: '/images' },
      });

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];

    await userEvent.click(actionMenu);

    const disabledEditText = await findAllByLabelText(
      "You don't have permissions to edit this Image. Please contact your account administrator to request the necessary permissions."
    );
    const disabledDeleteText = await findAllByLabelText(
      "You don't have permissions to delete this Image. Please contact your account administrator to request the necessary permissions."
    );
    const disabledLinodeCreationText = await findAllByLabelText(
      "You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions."
    );
    const disabledLinodeRebuildingText = await findAllByLabelText(
      "You don't have permissions to rebuild Linodes. Please contact your account administrator to request the necessary permissions."
    );

    expect(disabledEditText.length).toBe(2);
    expect(disabledDeleteText.length).toBe(1);
    expect(disabledLinodeCreationText.length).toBe(1);
    expect(disabledLinodeRebuildingText.length).toBe(1);
  });
});
