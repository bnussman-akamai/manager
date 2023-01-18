import { Action, Reducer } from 'redux';
import { Doc } from 'src/types/Documentation';

export type State = Doc[];

interface ClearType extends Action {
  type: typeof CLEAR;
}

interface SetType extends Action {
  type: typeof SET;
  payload: Doc[];
}

const CLEAR = '@@manager/documentation/CLEAR';
const SET = '@@manager/documentation/SET';

export const clearDocs = (): ClearType => ({
  type: CLEAR,
});

export const setDocs = (docs: Doc[]): SetType => ({
  type: SET,
  payload: docs,
});

export const defaultState: Doc[] = [];

const documentation: Reducer<State> = (
  state = defaultState,
  action: ClearType | SetType
) => {
  switch (action.type) {
    case CLEAR:
      return [];

    case SET:
      return action.payload;

    default:
      return state;
  }
};

export default documentation;
