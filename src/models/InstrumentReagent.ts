import { ObjectId } from 'mongodb';

export interface IInstrumentReagent {
  _id?: ObjectId;
  instrument_id: ObjectId;
  reagent_name: string; // NEW: Name of the reagent (Diluent, Lysing, Staining, etc.)
  reagent_lot_number: string;
  quantity: number; // NEW: Initial quantity when installed
  quantity_remaining: number; // NEW: Current remaining quantity
  expiration_date: Date; // NEW: Expiration date of the reagent
  vendor_name: string; // NEW: Vendor who supplied the reagent
  vendor_id?: string; // NEW: Optional vendor identifier
  vendor_contact?: string; // NEW: Optional vendor contact information
  installed_at: Date;
  installed_by: ObjectId;
  removed_at?: Date;
  removed_by?: ObjectId;
  status: 'in_use' | 'not_in_use' | 'expired'; // UPDATED: Changed from 'active' | 'removed' | 'expired'
  created_at: Date;
  created_by: ObjectId;
}

export type InstrumentReagentDocument = IInstrumentReagent & {
  _id: ObjectId;
  created_at: Date;
};

export type CreateInstrumentReagentInput = Omit<IInstrumentReagent, '_id' | 'created_at' | 'quantity_remaining' | 'created_by'> & {
  quantity_remaining?: number; // Optional, defaults to quantity if not provided
};
export type UpdateInstrumentReagentInput = Partial<Omit<IInstrumentReagent, '_id' | 'created_at'>>;
