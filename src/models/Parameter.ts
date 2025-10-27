import { ObjectId } from 'mongodb';

export interface IParameter {
  _id?: ObjectId;
  parameter_code: string;
  parameter_name: string;
  abbreviation?: string;
  unit: string;
  description?: string;
  normal_range?: any; // JSONB equivalent for range data
  is_active: boolean;
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
}

export type ParameterDocument = IParameter & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreateParameterInput = Omit<IParameter, '_id' | 'created_at' | 'updated_at'>;
export type UpdateParameterInput = Partial<Omit<IParameter, '_id' | 'created_at' | 'updated_at'>>;
