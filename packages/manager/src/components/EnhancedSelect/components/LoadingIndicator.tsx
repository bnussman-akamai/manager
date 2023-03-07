import * as React from 'react';
import { LoadingIconProps } from 'react-select/src/components/indicators';
import CircularProgress from 'src/components/core/CircularProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      right: 20,
    },
  });

interface Props extends LoadingIconProps<any, any> {}

type CombinedProps = Props & WithStyles<ClassNames>;

class LoadingIndicator extends React.PureComponent<CombinedProps> {
  render() {
    const { classes } = this.props;

    return (
      <CircularProgress
        data-testid="input-loading"
        size={20}
        className={classes.root}
      />
    );
  }
}

const styled = withStyles(styles);

export default styled(LoadingIndicator);
