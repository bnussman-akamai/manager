import { grantsFactory, profileFactory } from '@linode/utilities';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import ImagesLanding from './ImagesLanding';
import { migrationRouteTree } from 'src/routes';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

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
      initialRoute: '/images',
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

    const { findByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(await findByText('No Custom Images to display.')).toBeVisible();
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

    const { findByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(await findByText('No Recovery Images to display.')).toBeVisible();
  });

  it('should render images landing empty state', async () => {
    server.use(
      http.get('*/images', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { findByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(
      await findByText(
        'Store custom Linux images to rapidly deploy compute instances preconfigured with what you need.'
      )
    ).toBeVisible();
  });

  it('should allow opening the Edit Image drawer', async () => {
    const image = imageFactory.build();

    server.use(
      http.get('*/images', ({ request }) => {
        const filter = request.headers.get('x-filter');
        if (filter?.includes('manual')) {
          return HttpResponse.json(makeResourcePage([image]));
        }
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, findByText, findByLabelText } = renderWithTheme(
      <ImagesLanding />,
      {
        initialRoute: '/images',
      }
    );

    const actionMenu = await findByLabelText(
      `Action menu for Image ${image.label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Edit'));

    await findByText('Edit Image');
  });

  it('should allow opening the Restore Image drawer', async () => {
    const image = imageFactory.build();

    server.use(
      http.get('*/images', ({ request }) => {
        const filter = request.headers.get('x-filter');
        if (filter?.includes('manual')) {
          return HttpResponse.json(makeResourcePage([image]));
        }
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { findByText, getByText, findByLabelText } = renderWithTheme(
      <ImagesLanding />,
      { initialRoute: '/images' }
    );

    const actionMenu = await findByLabelText(
      `Action menu for Image ${image.label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Rebuild an Existing Linode'));

    expect(
      await findByText('Rebuild an Existing Linode from an Image')
    ).toBeVisible();
  });

  it('should allow deploying to a new Linode', async () => {
    const image = imageFactory.build();

    server.use(
      http.get('*/images', ({ request }) => {
        const filter = request.headers.get('x-filter');
        if (filter?.includes('manual')) {
          return HttpResponse.json(makeResourcePage([image]));
        }
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, findByLabelText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    const actionMenu = await findByLabelText(
      `Action menu for Image ${image.label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Deploy to New Linode'));

    // @todo: assert URL from router's state
  });

  it.only('should allow deleting an image', async () => {
    const image = imageFactory.build();

    server.use(
      http.get('*/images', ({ request }) => {
        const filter = request.headers.get('x-filter');
        if (filter?.includes('manual')) {
          return HttpResponse.json(makeResourcePage([image]));
        }
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const rootRoute = createRootRoute({});
    const imagesLandingRoute = createRoute({
      component: ImagesLanding,
      getParentRoute: () => rootRoute,
      path: '/images',
    });
    const imagesEditRoute = createRoute({
      component: ImagesLanding,
      getParentRoute: () => imagesLandingRoute,
      path: '$imageId/$action',
    });

    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/images'],
      }),
      routeTree: rootRoute.addChildren([imagesLandingRoute.addChildren([imagesEditRoute])]),
    });

    const { getByText, findByLabelText, findByText } = renderWithTheme(
      <ImagesLanding />,
      { router }
    );

    const actionMenu = await findByLabelText(
      `Action menu for Image ${image.label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Delete'));

    expect(
      await findByText('Are you sure you want to delete this Image?')
    ).toBeVisible();
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
      initialRoute: '/images',
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
    const image = imageFactory.build({
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
      http.get('*/v4/images', ({ request }) => {
        const filter = request.headers.get('x-filter');
        if (filter?.includes('manual')) {
          return HttpResponse.json(makeResourcePage([image]));
        }
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { findByLabelText, findAllByLabelText } = renderWithTheme(
      <ImagesLanding />,
      { initialRoute: '/images' }
    );

    const actionMenu = await findByLabelText(
      `Action menu for Image ${image.label}`
    );

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
