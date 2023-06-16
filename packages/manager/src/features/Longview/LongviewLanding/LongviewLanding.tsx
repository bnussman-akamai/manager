import {
  getActiveLongviewPlan,
  getLongviewSubscriptions,
} from '@linode/api-v4/lib/longview';
import {
  ActiveLongviewPlan,
  LongviewSubscription,
} from '@linode/api-v4/lib/longview/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import LandingHeader from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import withLongviewClients, {
  Props as LongviewProps,
} from 'src/containers/longview.container';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useAccountSettings } from 'src/queries/accountSettings';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import SubscriptionDialog from './SubscriptionDialog';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const LongviewClients = React.lazy(() => import('./LongviewClients'));
const LongviewPlans = React.lazy(() => import('./LongviewPlans'));

type CombinedProps = LongviewProps &
  RouteComponentProps<{}> &
  WithSnackbarProps;

export const LongviewLanding: React.FunctionComponent<CombinedProps> = (
  props
) => {
  const activeSubscriptionRequestHook = useAPIRequest<ActiveLongviewPlan>(
    () => getActiveLongviewPlan().then((response) => response),
    {}
  );
  const subscriptionsRequestHook = useAPIRequest<LongviewSubscription[]>(
    () => getLongviewSubscriptions().then((response) => response.data),
    []
  );

  const { createLongviewClient } = props;

  const { data: accountSettings } = useAccountSettings();

  const isManaged = Boolean(accountSettings?.managed);

  const [newClientLoading, setNewClientLoading] = React.useState<boolean>(
    false
  );
  const [
    subscriptionDialogOpen,
    setSubscriptionDialogOpen,
  ] = React.useState<boolean>(false);

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Clients',
      routeName: `${props.match.url}/clients`,
    },
    {
      title: 'Plan Details',
      routeName: `${props.match.url}/plan-details`,
    },
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  const handleAddClient = () => {
    setNewClientLoading(true);
    createLongviewClient()
      .then((_) => {
        setNewClientLoading(false);
        if (props.history.location.pathname !== '/longview/clients') {
          props.history.push('/longview/clients');
        }
      })
      .catch((errorResponse) => {
        if (errorResponse[0].reason.match(/subscription/)) {
          // The user has reached their subscription limit.
          setSubscriptionDialogOpen(true);
        } else {
          // Any network or other errors handled with a toast
          props.enqueueSnackbar(
            getAPIErrorOrDefault(
              errorResponse,
              'Error creating Longview client.'
            )[0].reason,
            { variant: 'error' }
          );
          setNewClientLoading(false);
        }
      });
  };

  const handleSubmit = () => {
    const {
      history: { push },
    } = props;

    if (isManaged) {
      push({
        pathname: '/support/tickets',
        state: {
          open: true,
          title: 'Request for additional Longview clients',
        },
      });
      return;
    }
    props.history.push('/longview/plan-details');
  };

  const index = Math.max(
    tabs.findIndex((tab) => matches(tab.routeName)),
    0
  );

  return (
    <>
      <LandingHeader
        title="Longview"
        entity="Client"
        createButtonText="Add Client"
        docsLink="https://www.linode.com/docs/platform/longview/longview/"
        loading={newClientLoading}
        onButtonClick={handleAddClient}
        removeCrumbX={1}
      />
      <Tabs
        value={index}
        onChange={(_, i) => navToURL(i)}
        style={{ marginTop: 0 }}
      >
        {tabs.map((t) => (
          <Tab key={t.title} label={t.title} />
        ))}
      </Tabs>
      <React.Suspense fallback={<SuspenseLoader />}>
        <SafeTabPanel value={index} index={0}>
          <LongviewClients
            activeSubscription={activeSubscriptionRequestHook.data}
            handleAddClient={handleAddClient}
            newClientLoading={newClientLoading}
            {...props}
          />
        </SafeTabPanel>
        <SafeTabPanel value={index} index={1}>
          <LongviewPlans subscriptionRequestHook={subscriptionsRequestHook} />
        </SafeTabPanel>
      </React.Suspense>
      <SubscriptionDialog
        isOpen={subscriptionDialogOpen}
        isManaged={isManaged}
        onClose={() => setSubscriptionDialogOpen(false)}
        onSubmit={handleSubmit}
        clientLimit={
          isEmpty(activeSubscriptionRequestHook.data)
            ? 10
            : (activeSubscriptionRequestHook.data as LongviewSubscription)
                .clients_included
        }
      />
    </>
  );
};

export default compose<CombinedProps, {} & RouteComponentProps>(
  withLongviewClients(),
  withSnackbar
)(LongviewLanding);
