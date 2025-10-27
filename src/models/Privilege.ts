import { ObjectId } from 'mongodb';

export interface IPrivilege {
  _id?: ObjectId;
  privilege_code: string;
  privilege_name: string;
  category?: string;
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
}

export type PrivilegeDocument = IPrivilege & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreatePrivilegeInput = Omit<IPrivilege, '_id' | 'created_at' | 'updated_at'>;
export type UpdatePrivilegeInput = Partial<Omit<IPrivilege, '_id' | 'created_at' | 'updated_at'>>;
