import { ObjectId } from 'mongodb';

export enum InstrumentType {
  HEMATOLOGY = "Hematology Analyzer",
  CHEMISTRY = "Chemistry Analyzer",
  IMMUNOLOGY = "Immunology Analyzer",
  COAGULATION = "Coagulation Analyzer",
  BLOOD_GAS = "Blood Gas Analyzer"
}

export interface IConfiguration {
  _id?: ObjectId;
  config_key: string;
  config_name: string;
  config_value: number; // store numeric configuration value
  category: string;
  instrument_type?: InstrumentType;
  created_at?: Date;
  created_by?: ObjectId;
  updated_at?: Date;
  updated_by?: ObjectId;
}

export type ConfigurationDocument = IConfiguration & {
  _id: ObjectId;
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
};

export type CreateConfigurationInput = Pick<IConfiguration, 'config_key' | 'config_name' | 'config_value' | 'category' | 'instrument_type'>;

export type UpdateConfigurationInput = Partial<CreateConfigurationInput>;
