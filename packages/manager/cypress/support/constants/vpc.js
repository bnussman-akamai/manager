"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vpcUnassignLinodeRebootNotice = exports.vpcAssignLinodeRebootNotice = void 0;
/** Notice shown to users trying to assign a linode to a VPC. */
exports.vpcAssignLinodeRebootNotice = 'Assigning a Linode to a subnet requires you to reboot the Linode to update its configuration.';
/** Notice shown to users trying to unassign a linode from a VPC. */
exports.vpcUnassignLinodeRebootNotice = 'Unassigning Linodes from a subnet requires you to reboot the Linodes to update its configuration.';
