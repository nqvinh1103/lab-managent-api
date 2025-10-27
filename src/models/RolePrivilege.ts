import { ObjectId } from 'mongodb';

export interface IRolePrivilege {
  _id?: ObjectId;
  role_id: ObjectId;
  privilege_id: ObjectId;
  created_at: Date;
  created_by: ObjectId;
}

export type RolePrivilegeDocument = IRolePrivilege & {
  _id: ObjectId;
  created_at: Date;
};

export type CreateRolePrivilegeInput = Omit<IRolePrivilege, '_id' | 'created_at'>;
