import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import {
  IInstrumentReagent,
  InstrumentReagentDocument,
  CreateInstrumentReagentInput,
  UpdateInstrumentReagentInput
} from '../models/InstrumentReagent';

const COLLECTION = 'instrument_reagents';

// Create
export const createInstrumentReagent = async (data: CreateInstrumentReagentInput): Promise<InstrumentReagentDocument> => {
  const collection = getCollection<IInstrumentReagent>(COLLECTION);
  const now = new Date();

  const newDoc: IInstrumentReagent = {
    ...data,
    _id: new ObjectId(),
    created_at: now,
    status : 'active'
  };

  await collection.insertOne(newDoc);
  return newDoc as InstrumentReagentDocument;
};

// Read all
export const getAllInstrumentReagents = async (): Promise<InstrumentReagentDocument[]> => {
  const collection = getCollection<IInstrumentReagent>(COLLECTION);
  return await collection.find({}).toArray() as InstrumentReagentDocument[];
};

// Read by id
export const getInstrumentReagentById = async (id: string): Promise<InstrumentReagentDocument> => {
  if (!ObjectId.isValid(id)) throw new Error('Invalid ObjectId');

  const collection = getCollection<IInstrumentReagent>(COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error('Document not found');

  return doc as InstrumentReagentDocument;
};

export const updateInstrumentReagent = async (
  id: string,
  data: UpdateInstrumentReagentInput
): Promise<InstrumentReagentDocument> => {
  if (!ObjectId.isValid(id)) throw new Error('Invalid ObjectId');

  const collection = getCollection<IInstrumentReagent>(COLLECTION);

  const allowedFields: (keyof UpdateInstrumentReagentInput)[] = [
    'instrument_id',
    'reagent_lot_number',
    'installed_at',
    'installed_by',
    'removed_at',
    'removed_by',
    'status',
    'created_by'
  ];

  const updateData: Partial<IInstrumentReagent> = {};
  allowedFields.forEach((key) => {
    if (key in data) (updateData as any)[key] = data[key];
  });

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) throw new Error('Document not found');

  return result as InstrumentReagentDocument;
};

// Delete
export const deleteInstrumentReagent = async (id: string): Promise<void> => {
  if (!ObjectId.isValid(id)) throw new Error('Invalid ObjectId');

  const collection = getCollection<IInstrumentReagent>(COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) throw new Error('Document not found');
};
