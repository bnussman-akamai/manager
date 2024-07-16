/* eslint-disable scanjs-rules/call_addEventListener */
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { ErrorState } from 'src/components/ErrorState/ErrorState';

import type { LinodeLishData } from '@linode/api-v4/lib/linodes';
import type { Linode } from '@linode/api-v4/lib/linodes';
import { CircleProgress } from 'src/components/CircleProgress';

interface Props {
  linode: Linode;
  refreshToken: () => Promise<void>;
}

interface State {
  error: string;
  renderingLish: boolean;
}

type CombinedProps = Props &
  Pick<LinodeLishData, 'weblish_url' | 'ws_protocols'>;

export class Weblish extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  socket: WebSocket;
  state: State = {
    error: '',
    renderingLish: true,
  };

  terminal: Terminal;
  fitAddon: FitAddon;

  componentDidMount() {
    this.mounted = true;
    this.connect();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    /*
     * If we have a new token, refresh the webosocket connection
     * and console with the new token
     */
    if (
      this.props.weblish_url !== prevProps.weblish_url ||
      JSON.stringify(this.props.ws_protocols) !==
        JSON.stringify(prevProps.ws_protocols)
    ) {
      this.socket.close();
      this.terminal.dispose();
      this.connect();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  connect() {
    const { weblish_url, ws_protocols } = this.props;

    this.socket = new WebSocket(weblish_url, ws_protocols);

    this.socket.addEventListener('open', () => {
      if (!this.mounted) {
        return;
      }
      this.setState({ renderingLish: true }, () => this.renderTerminal());
    });
  }

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <Box
          sx={{
            '& *': {
              color: '#f4f4f4 !important',
            },
          }}
        >
          <ErrorState errorText={error} />
        </Box>
      );
    }

    /*
     * The loading states have to render with the terminal div because
     * the messages from the websocket connection are sent during this loading period,
     * and if you're rendering a loading state, then get a message from websockets,
     * then render the terminal div, you end up with a blank black screen
     */
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {this.socket && this.socket.readyState === this.socket.OPEN ? (
          <div
            style={{
              height: 'calc(100vh - 50px)',
              width: 'initial !important',
            }}
            className="terminal"
            id="terminal"
          />
        ) : (
          <CircleProgress />
        )}
      </div>
    );
  }

  renderTerminal() {
    const { linode, refreshToken } = this.props;
    const { group, label } = linode;

    this.terminal = new Terminal({
      fontFamily: '"Ubuntu Mono", monospace, sans-serif',
    });
    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);

    this.terminal.onData((data: string) => this.socket.send(data));
    const terminalDiv = document.getElementById('terminal');
    this.terminal.open(terminalDiv as HTMLElement);

    window.onresize = () => {
      this.fitAddon.fit();
    };

    setTimeout(() => {
      this.fitAddon.fit();
    }, 500);

    // window.onkeydown = () => {
    //   this.fitAddon.fit();
    // };

    this.terminal.writeln('\x1b[32mLinode Lish Console\x1b[m');

    this.socket.addEventListener('message', (evt) => {
      let data;

      /*
       * data is either going to be command line strings
       * or it's going to look like {type: 'error', reason: 'thing failed'}
       * the latter can be JSON parsed and the other cannot
       */
      try {
        data = JSON.parse(evt.data);
      } catch {
        data = evt.data;
      }

      if (
        data?.type === 'error' &&
        data?.reason?.toLowerCase() === 'your session has expired.'
      ) {
        refreshToken();
        return;
      }

      try {
        this.terminal.write(evt.data);
      } catch {
        /**
         * We've most likely hit a data flow limit.
         * This is fine and won't break anything. However,
         * by reloading the page, we can bring the window back
         * in sync with the screen session that Weblish is connecting
         * to.
         */

        window.location.reload();
      }
    });

    this.socket.addEventListener('close', () => {
      this.terminal.dispose();
      if (!this.mounted) {
        return;
      }

      this.setState({ renderingLish: false });
    });

    const linodeLabel = group ? `${group}/${label}` : label;
    window.document.title = `${linodeLabel} - Linode Lish Console`;
  }
}

export default Weblish;
