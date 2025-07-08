import * as React from 'react';

import { supportTicketFactory } from 'src/factories/support';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { TicketRow } from './TicketRow';

const supportTicket = supportTicketFactory.build();

describe('TicketList component', () => {
  it('should render', () => {
    mockMatchMedia();
    const { getByTestId } = renderWithTheme(
      <table>
        <tbody>
          <TicketRow ticket={supportTicket} />
        </tbody>
      </table>
    );
    const ticketRow = getByTestId('ticket-row');
    expect(ticketRow).toBeInTheDocument();
  });
});
