import { ObjectId } from 'mongodb';

export interface IPatient {
  _id?: ObjectId;
  full_name: string;
  identity_number?: string;
  date_of_birth: Date;
  gender: 'male' | 'female';
  address?: string;
  phone_number?: string;
  email?: string;
  deleted_at?: Date;
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
}

export type PatientDocument = IPatient & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreatePatientInput = Omit<IPatient, '_id' | 'created_at' | 'updated_at'>;
export type UpdatePatientInput = Partial<Omit<IPatient, '_id' | 'created_at' | 'updated_at'>>;
