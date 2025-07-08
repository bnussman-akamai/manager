import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Breadcrumb } from './Breadcrumb';

import type { BreadcrumbProps } from './Breadcrumb';

const props: BreadcrumbProps = {
  pathname: '/linodes/9872893679817/test/lastcrumb',
};

describe('Breadcrumb component', () => {
  it('contains the appropriate number of link text', () => {
    const { getAllByTestId } = renderWithTheme(<Breadcrumb {...props} />);
    expect(getAllByTestId('link-text')).toHaveLength(3);
  });

  it('removes a crumb given the corresponding prop', () => {
    const { getAllByTestId } = renderWithTheme(
      <Breadcrumb {...props} removeCrumbX={2} />
    );
    expect(getAllByTestId('link-text')).toHaveLength(2);
  });

  it('removes multiple crumbs when given an array of indices', () => {
    const { getAllByTestId } = renderWithTheme(
      <Breadcrumb {...props} removeCrumbX={[1, 2]} />
    );
    expect(getAllByTestId('link-text')).toHaveLength(1);
  });

  it('renders an editable text field given editable props', () => {
    const { queryByTestId } = renderWithTheme(
      <Breadcrumb
        {...props}
        onEditHandlers={{
          editableTextTitle: 'Editable text',
          onCancel: vi.fn(),
          onEdit: vi.fn(),
        }}
      />
    );
    expect(queryByTestId('editable-text')).toBeInTheDocument();
  });
});
