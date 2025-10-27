import { ObjectId } from 'mongodb';

export interface IUserRole {
  _id?: ObjectId;
  user_id: ObjectId;
  role_id: ObjectId;
  created_at: Date;
  created_by: ObjectId;
}

export type UserRoleDocument = IUserRole & {
  _id: ObjectId;
  created_at: Date;
};

export type CreateUserRoleInput = Omit<IUserRole, '_id' | 'created_at'>;
