import { ObjectId } from 'mongodb';

export interface IFlaggingConfiguration {
  _id?: ObjectId;
  parameter_id: ObjectId;
  age_group?: string;
  gender?: 'male' | 'female';
  reference_range_min?: number;
  reference_range_max?: number;
  flag_type: 'critical' | 'warning' | 'info';
  is_active: boolean;
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
}

export type FlaggingConfigurationDocument = IFlaggingConfiguration & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreateFlaggingConfigurationInput = Omit<IFlaggingConfiguration, '_id' | 'created_at' | 'updated_at'>;
export type UpdateFlaggingConfigurationInput = Partial<Omit<IFlaggingConfiguration, '_id' | 'created_at' | 'updated_at'>>;
