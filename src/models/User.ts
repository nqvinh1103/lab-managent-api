import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  email: string;
  phone_number: string;
  full_name: string;
  identity_number: string;
  gender: 'male' | 'female';
  address?: string;
  date_of_birth: Date;
  password_hash: string;
  password_expires_at?: Date;
  is_locked: boolean;
  last_activity: Date;
  role_ids: ObjectId[];
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
}

export type UserDocument = IUser & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreateUserInput = Omit<IUser, '_id' | 'created_at' | 'updated_at' | 'last_activity' | 'role_ids'>;
export type UpdateUserInput = Partial<Omit<IUser, '_id' | 'created_at' | 'updated_at' | 'last_activity'>>;