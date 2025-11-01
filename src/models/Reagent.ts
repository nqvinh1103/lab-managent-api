import { ObjectId } from 'mongodb';

export interface IReagent {
  _id?: ObjectId;
  reagent_name: string; // Fixed: Diluent, Lysing, Staining, Clotting, Cleaner (from SRS 2.5)
  description: string; // Description from SRS 2.5
  usage_per_run_min: number; // Minimum usage per run (e.g., 1 ml, 50 µL)
  usage_per_run_max: number; // Maximum usage per run (e.g., 2 ml, 200 µL)
  usage_unit: string; // Unit of measure (e.g., "ml", "µL")
  is_active: boolean; // Whether this reagent type is active
  created_at: Date;
  updated_at: Date;
}

export type ReagentDocument = IReagent & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreateReagentInput = Omit<IReagent, '_id' | 'created_at' | 'updated_at'>;
export type UpdateReagentMetadataInput = Partial<Pick<IReagent, 'description' | 'usage_per_run_min' | 'usage_per_run_max' | 'usage_unit' | 'is_active'>>;

