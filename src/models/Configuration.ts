import { ObjectId } from 'mongodb';

export interface IConfiguration {
  _id?: ObjectId;
  config_key: string;
  config_name: string;
  config_value: any; // JSONB equivalent
  category: string;
  instrument_type?: string;
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
}

export type ConfigurationDocument = IConfiguration & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreateConfigurationInput = Omit<IConfiguration, '_id' | 'created_at' | 'updated_at'>;
export type UpdateConfigurationInput = Partial<Omit<IConfiguration, '_id' | 'created_at' | 'updated_at'>>;
