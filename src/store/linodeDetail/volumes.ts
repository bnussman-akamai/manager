import { getLinodeVolumes } from 'src/services/linodes';
import { RequestableData, ThunkActionCreator } from 'src/store/types';

// ACTIONS
const actionTypeGenerator = (s: string) =>
  `@manager/features/linodeDetail/volumes/${s}`;

const LOAD = actionTypeGenerator('LOAD');
const SUCCESS = actionTypeGenerator('SUCCESS');
const ERROR = actionTypeGenerator('ERROR');
const UPDATE = actionTypeGenerator('UPDATE');

// STATE
export type State = RequestableData<Linode.Volume[]>;

export const defaultState: State = {
  lastUpdated: 0,
  loading: false
};

// ACTION CREATORS
export const load = () => ({ type: LOAD });

export const handleSuccess = (payload: Linode.Volume[]) => ({
  type: SUCCESS,
  payload
});

export const handleError = (payload: Error) => ({ type: ERROR, payload });

export const handleUpdate = (
  updateFn: (v: Linode.Volume[]) => Linode.Volume[]
) => ({ type: UPDATE, updateFn });

// REDUCER
export default (state = defaultState, action: any) => {
  switch (action.type) {
    case LOAD:
      return { ...state, loading: true };

    case SUCCESS:
      return {
        ...state,
        loading: false,
        lastUpdated: Date.now(),
        data: action.payload
      };

    case ERROR:
      return {
        ...state,
        loading: false,
        lastUpdated: Date.now(),
        error: action.payload
      };

    case UPDATE:
      return {
        ...state,
        loading: false,
        lastUpdated: Date.now(),
        data: action.updateFn(state.data)
      };

    default:
      return state;
  }
};

// ASYNC
export const _getLinodeVolumes: ThunkActionCreator<void> = (
  linodeId: number
) => (dispatch, getState) => {
  dispatch(load());

  getLinodeVolumes(linodeId)
    .then(response => dispatch(handleSuccess(response.data)))
    .catch(error => dispatch(handleError(error)));
};

// HELPERS
