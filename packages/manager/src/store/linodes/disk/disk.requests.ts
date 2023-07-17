/**
 * @note Make sure you add the linode_id to the disk object!`
 */

import { Filter, Params } from '@linode/api-v4';
import {
  createLinodeDisk as _createLinodeDisk,
  deleteLinodeDisk as _deleteLinodeDisk,
  getLinodeDisk as _getLinodeDisk,
  getLinodeDisks as _getLinodeDisks,
  resizeLinodeDisk as _resizeLinodeDisk,
  updateLinodeDisk as _updateLinodeDisk,
  Disk,
} from '@linode/api-v4/lib/linodes';

import { createRequestThunk } from 'src/store/store.helpers';
import { getAll } from 'src/utilities/getAll';

import {
  createLinodeDiskActions,
  deleteLinodeDiskActions,
  getAllLinodeDisksActions,
  getLinodeDiskActions,
  getLinodeDisksActions,
  resizeLinodeDiskActions,
  updateLinodeDiskActions,
} from './disk.actions';
import { Entity } from './disk.types';

const addLinodeIdToDisk = (linodeId: number) => (disk: Disk): Entity => ({
  ...disk,
  linode_id: linodeId,
});

export const createLinodeDisk = createRequestThunk(
  createLinodeDiskActions,
  ({ linodeId, ...data }) =>
    _createLinodeDisk(linodeId, data).then(addLinodeIdToDisk(linodeId))
);

export const getLinodeDisks = createRequestThunk(
  getLinodeDisksActions,
  ({ linodeId }) =>
    _getLinodeDisks(linodeId).then((result) => ({
      data: result.data.map(addLinodeIdToDisk(linodeId)),
      results: result.results,
    }))
);

export const getAllLinodeDisks = createRequestThunk(
  getAllLinodeDisksActions,
  ({ linodeId }) =>
    getAll<Disk>((diskParams: Params, filter: Filter) =>
      _getLinodeDisks(linodeId, diskParams, filter)
    )().then((result) => ({
      data: result.data.map(addLinodeIdToDisk(linodeId)),
      results: result.results,
    }))
);

export const getLinodeDisk = createRequestThunk(
  getLinodeDiskActions,
  ({ diskId, linodeId }) =>
    _getLinodeDisk(linodeId, diskId).then(addLinodeIdToDisk(linodeId))
);

export const updateLinodeDisk = createRequestThunk(
  updateLinodeDiskActions,
  ({ diskId, linodeId, ...data }) =>
    _updateLinodeDisk(linodeId, diskId, data).then(addLinodeIdToDisk(linodeId))
);

export const deleteLinodeDisk = createRequestThunk(
  deleteLinodeDiskActions,
  ({ diskId, linodeId }) => _deleteLinodeDisk(linodeId, diskId)
);

export const resizeLinodeDisk = createRequestThunk(
  resizeLinodeDiskActions,
  ({ diskId, linodeId, size }) =>
    _resizeLinodeDisk(linodeId, diskId, size).then(addLinodeIdToDisk(linodeId))
);
