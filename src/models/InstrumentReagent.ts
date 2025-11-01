import { ObjectId } from 'mongodb';

export interface IInstrumentReagent {
  _id?: ObjectId;
  instrument_id: ObjectId;
  reagent_inventory_id: ObjectId; // Reference to ReagentInventory (warehouse)
  reagent_id: ObjectId; // Reference to Reagent master (SRS 2.5)
  
  // Master data from Reagent (for display and reference)
  reagent_name: string; // From Reagent master (Diluent, Lysing, Staining, Clotting, Cleaner)
  description: string; // From Reagent master
  usage_per_run_min: number; // From Reagent master
  usage_per_run_max: number; // From Reagent master
  usage_unit: string; // From Reagent master
  
  // Batch info from Inventory
  reagent_lot_number: string; // From ReagentInventory
  expiration_date: Date; // From ReagentInventory
  
  // Installation info
  quantity: number; // Initial quantity when installed
  quantity_remaining: number; // Current remaining quantity
  installed_at: Date;
  installed_by: ObjectId;
  removed_at?: Date;
  removed_by?: ObjectId;
  status: 'in_use' | 'not_in_use' | 'expired';
  created_at: Date;
  created_by: ObjectId;
}

export type InstrumentReagentDocument = IInstrumentReagent & {
  _id: ObjectId;
  created_at: Date;
};

export type CreateInstrumentReagentInput = Omit<IInstrumentReagent, '_id' | 'created_at' | 'quantity_remaining' | 'created_by' | 'reagent_id' | 'reagent_name' | 'description' | 'usage_per_run_min' | 'usage_per_run_max' | 'usage_unit' | 'reagent_lot_number' | 'expiration_date' | 'installed_at' | 'installed_by'> & {
  reagent_inventory_id: ObjectId; // Required: reference to ReagentInventory
  // quantity_remaining will be automatically set to quantity when creating
  installed_at?: Date; // Optional, defaults to current time if not provided
  installed_by?: ObjectId; // Optional, defaults to current user if not provided
};
export type UpdateInstrumentReagentInput = Partial<Omit<IInstrumentReagent, '_id' | 'created_at' | 'reagent_id' | 'reagent_name' | 'description' | 'usage_per_run_min' | 'usage_per_run_max' | 'usage_unit'>>;
