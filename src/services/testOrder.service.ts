import { ObjectId } from "mongodb";
import { getCollection } from "../config/database";
import {
  ITestOrder,
  TestOrderDocument,
  CreateTestOrderInput,
  UpdateTestOrderInput,
} from "../models/TestOrder";

const COLLECTION = "test_orders";
const PATIENT_COLLECTION = 'patients';

export const createTestOrder = async (
  input: CreateTestOrderInput & { patient_email: string },
  createdBy: string | ObjectId
): Promise<TestOrderDocument> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const patientCollection = getCollection<any>(PATIENT_COLLECTION);
  const now = new Date();

  // 🔍 1. Tìm bệnh nhân theo email
  const patient = await patientCollection.findOne({ email: input.patient_email });
  if (!patient) {
    throw new Error(`Patient with email "${input.patient_email}" not found`);
    
  }
  console.log('Patient not found ---------------------' + input.patient_email);

  // ✅ 2. Generate order number & barcode
  const orderNumber = `ORD-${Date.now()}`;
  const barcode = `BC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // ✅ 3. Normalize createdBy
  const createdById = createdBy instanceof ObjectId ? createdBy : new ObjectId(String(createdBy));

  // ✅ 4. Build document (lưu patient_id, không lưu email)
  const newOrder: ITestOrder = {
    order_number: orderNumber,
    patient_id: new ObjectId(patient._id),  // 👈 gán id từ bệnh nhân tìm được
    instrument_id: input.instrument_id ? new ObjectId(input.instrument_id) : undefined,
    barcode,
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

  // ✅ 5. Insert vào DB
  const result = await collection.insertOne(newOrder as TestOrderDocument);

  // ✅ 6. Lấy lại document vừa insert
  const inserted = await collection.findOne({ _id: result.insertedId });
  if (!inserted) throw new Error("Failed to create test order");

  return inserted as TestOrderDocument;
};

export const getAllTestOrders = async (): Promise<any[]> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);

  const items = await collection
    .aggregate([
      {
        $lookup: {
          from: "patients",              // Tên collection chứa thông tin bệnh nhân
          localField: "patient_id",      // Field trong test_orders
          foreignField: "_id",           // Field trong patients
          as: "patient_info"             // Tên field mới chứa thông tin bệnh nhân
        }
      },
      {
        $unwind: {
          path: "$patient_info",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          patient_email: "$patient_info.email" // Thêm field mới là email
        }
      },
      {
        $project: {
          patient_info: 0, // Ẩn thông tin chi tiết bệnh nhân (chỉ giữ email)
        }
      }
    ])
    .toArray();

  return items;
};


export const getTestOrderById = async (id: string): Promise<any | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);

  try {
    const _id = new ObjectId(id);
    const result = await collection
      .aggregate([
        { $match: { _id } },
        {
          $lookup: {
            from: "patients",
            localField: "patient_id",
            foreignField: "_id",
            as: "patient_info"
          }
        },
        { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },
        { $addFields: { patient_email: "$patient_info.email" } },
        { $project: { patient_info: 0 } }
      ])
      .toArray();

    return result[0] || null;
  } catch (err) {
    return null;
  }
};


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
