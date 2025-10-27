import { ObjectId } from 'mongodb';

export interface IInstrumentReagent {
  _id?: ObjectId;
  instrument_id: ObjectId;
  reagent_lot_number: string;
  installed_at: Date;
  installed_by: ObjectId;
  removed_at?: Date;
  removed_by?: ObjectId;
  status: 'active' | 'removed' | 'expired';
  created_at: Date;
  created_by: ObjectId;
}

export type InstrumentReagentDocument = IInstrumentReagent & {
  _id: ObjectId;
  created_at: Date;
};

export type CreateInstrumentReagentInput = Omit<IInstrumentReagent, '_id' | 'created_at'>;
export type UpdateInstrumentReagentInput = Partial<Omit<IInstrumentReagent, '_id' | 'created_at'>>;
