import { ObjectId } from 'mongodb';

export interface IRole {
  _id?: ObjectId;
  role_name: string;
  role_code: string;
  role_description?: string;
  privilege_ids: ObjectId[];
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
}

export type RoleDocument = IRole & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreateRoleInput = Omit<IRole, '_id' | 'created_at' | 'updated_at'>;
export type UpdateRoleInput = Partial<Omit<IRole, '_id' | 'created_at' | 'updated_at'>>;