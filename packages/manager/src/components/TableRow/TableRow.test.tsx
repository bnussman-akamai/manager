import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import TableCell from 'src/components/TableCell';
import { wrapWithTableBody } from 'src/utilities/testHelpers';
import { CombinedProps, TableRow } from './TableRow';

const mockHistoryPush = jest.fn();

const props: CombinedProps = {
  classes: {
    root: '',
    selected: '',
  },
};

describe('TableRow component', () => {
  it.skip('calls history.push with the given rowLink', () => {
    const { getByText } = render(
      wrapWithTableBody(
        <TableRow {...(props as any)} rowLink={'/test-url'}>
          <TableCell>Test Text</TableCell>
        </TableRow>
      )
    );

    fireEvent.click(getByText('Test Text'));
    expect(mockHistoryPush).toHaveBeenCalledWith('/test-url');
  });
});
