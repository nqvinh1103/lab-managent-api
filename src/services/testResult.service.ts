import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { ITestResult, CreateTestResultInput, UpdateTestResultInput } from '../models/TestOrder';

const COLLECTION = 'test_results';

/**
 * CREATE - Thêm kết quả xét nghiệm mới
 */
export const createTestResult = async (data: CreateTestResultInput, createdBy?: string | ObjectId): Promise<ITestResult> => {
  const collection = getCollection<ITestResult>(COLLECTION);
  const now = new Date();

  // Convert createdBy to ObjectId if provided
  const createdById = createdBy ? new ObjectId(String(createdBy)) : undefined;

  const newResult: ITestResult = {
    ...data,
    created_at: now,
    updated_at: now,
    created_by: createdById,
    updated_by: createdById,
  };

  const result = await collection.insertOne(newResult);
  return { ...newResult, _id: result.insertedId };
};

/**
 * READ - Lấy tất cả kết quả xét nghiệm
 */
export const getAllTestResults = async (): Promise<ITestResult[]> => {
  const collection = getCollection<ITestResult>(COLLECTION);
  return collection.find().toArray();
};

/**
 * READ - Lấy chi tiết theo ID
 */
export const getTestResultById = async (id: string): Promise<ITestResult | null> => {
  const collection = getCollection<ITestResult>(COLLECTION);
  return collection.findOne({ _id: new ObjectId(id) });
};

/**
 * UPDATE - Cập nhật kết quả xét nghiệm
 */
export const updateTestResult = async (
  id: string,
  data: UpdateTestResultInput
): Promise<ITestResult | null> => {
  const collection = getCollection<ITestResult>(COLLECTION);
  const now = new Date();

  try {
    // Kiểm tra ObjectId hợp lệ
    if (!ObjectId.isValid(id)) {
      console.warn(`⚠️ Invalid ObjectId: ${id}`);
      return null;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updated_at: now } },
      { returnDocument: 'after' } // trả về document sau khi update
    );

    // result.value có thể là null nếu không tìm thấy document
    return result ?? null;
  } catch (error) {
    console.error('❌ Error updating test result:', error);
    return null;
  }
};

/**
 * DELETE - Xóa kết quả xét nghiệm
 */
export const deleteTestResult = async (id: string): Promise<boolean> => {
  const collection = getCollection<ITestResult>(COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
};


