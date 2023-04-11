import EnhancedSelect, {
  BaseSelectProps as _BaseSelectProps,
  GroupType as _GroupType,
  Item as _Item,
} from './Select';
/* tslint:disable */
export interface Item<T> extends _Item<T> {}
export interface GroupType<T> extends _GroupType<T> {}
export interface BaseSelectProps<T extends boolean>
  extends _BaseSelectProps<T> {}
export default EnhancedSelect;
