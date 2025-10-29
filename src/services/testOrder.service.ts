import { ObjectId } from "mongodb";
import { getCollection } from "../config/database";
import {
  ITestOrder,
  TestOrderDocument,
  TestOrderWithPatient,
  CreateTestOrderInput,
  UpdateTestOrderInput,
} from "../models/TestOrder";

const COLLECTION = "test_orders";

export const createTestOrder = async (
  input: CreateTestOrderInput,
  createdBy: string | ObjectId
): Promise<TestOrderDocument> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const now = new Date();

  // ✅ Generate unique order number
  const orderNumber = `ORD-${Date.now()}`;
  const barcode = `BC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  // Normalize createdBy to an ObjectId
  const createdById = createdBy instanceof ObjectId ? createdBy : new ObjectId(String(createdBy));

  // ✅ Build new order document
  const newOrder: ITestOrder = {
    order_number: orderNumber,
    patient_id: new ObjectId(input.patient_id),
    instrument_id: input.instrument_id ? new ObjectId(input.instrument_id) : undefined,
    barcode: barcode,
    status: "pending",
    test_results: [],
    comments: [],
    run_by: undefined,
    run_at: undefined,
    created_at: now,
    created_by: createdById,
    updated_at: now,
    updated_by: createdById,
  };

  // ✅ Insert new document
  const result = await collection.insertOne(newOrder as TestOrderDocument);

  // ✅ Retrieve the inserted document
  const inserted = await collection.findOne({ _id: result.insertedId });

  if (!inserted) {
    throw new Error("Failed to create test order");
  }

  return inserted as TestOrderDocument;
};

export const getAllTestOrders = async (): Promise<TestOrderWithPatient[]> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  
  const pipeline = [
    // Lookup patient with pipeline to filter deleted patients
    {
      $lookup: {
        from: 'patients',
        let: { patientId: '$patient_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$patientId'] },
              deleted_at: { $exists: false }
            }
          }
        ],
        as: 'patient'
      }
    },
    // Unwind patient array to object (or null if not found)
    {
      $unwind: {
        path: '$patient',
        preserveNullAndEmptyArrays: true
      }
    },
    // Remove patient_id from response
    {
      $project: {
        patient_id: 0
      }
    }
  ];
  
  const items = await collection.aggregate<TestOrderWithPatient>(pipeline).toArray();
  return items;
}

export const getTestOrderById = async (id: string): Promise<TestOrderWithPatient | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  try {
    const _id = new ObjectId(id);
    
    const pipeline = [
      // Match the specific test order
      {
        $match: { _id }
      },
      // Lookup patient with pipeline to filter deleted patients
      {
        $lookup: {
          from: 'patients',
          let: { patientId: '$patient_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$patientId'] },
                deleted_at: { $exists: false }
              }
            }
          ],
          as: 'patient'
        }
      },
      // Unwind patient array to object (or null if not found)
      {
        $unwind: {
          path: '$patient',
          preserveNullAndEmptyArrays: true
        }
      },
      // Remove patient_id from response
      {
        $project: {
          patient_id: 0
        }
      }
    ];
    
    const result = await collection.aggregate<TestOrderWithPatient>(pipeline).toArray();
    return result[0] || null;
  } catch (err) {
    return null;
  }
}

export const updateTestOrder = async (
  id: string,
  data: UpdateTestOrderInput
): Promise<TestOrderDocument | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const now = new Date();

  try {
    const _id = new ObjectId(id);
    await collection.updateOne(
      { _id },
      { $set: { ...data, updated_at: now } }
    );

    const updated = await collection.findOne({ _id });
    return updated as TestOrderDocument | null;
  } catch (err) {
    return null;
  }
}

export const deleteTestOrder = async (id: string): Promise<boolean> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  try {
    const _id = new ObjectId(id);
    const result = await collection.deleteOne({ _id });
    return result.deletedCount === 1;
  } catch (err) {
    return false;
  }
}
