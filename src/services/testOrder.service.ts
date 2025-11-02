import * as ExcelJS from "exceljs";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database";
import { withTransaction } from "../utils/transaction.helper";
import {
  CreateTestOrderInput,
  ITestOrder,
  TestOrderDocument,
  UpdateTestOrderWithPatientInput
} from "../models/TestOrder";
import { QueryResult } from "../utils/database.helper";

const COLLECTION = "test_orders";
const PATIENT_COLLECTION = 'patients';

export const createTestOrder = async (
  input: CreateTestOrderInput & { patient_email: string; instrument_name?: string },
  createdBy: string | ObjectId
): Promise<QueryResult<TestOrderDocument>> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const patientCollection = getCollection<any>(PATIENT_COLLECTION);
  const now = new Date();
  // 🔍 1. Tìm bệnh nhân theo email
  const patient = await patientCollection.findOne({ email: input.patient_email });
  console.log("patient vvvvvvvvvvvvvvvvvvvvvvv", input.patient_email, patient);
  if (!patient) {
    return {
      success: false,
      error: `Patient with email ot found`,
      statusCode: 400
    };
  }

  // 🔍 Resolve instrument: prefer explicit instrument_id, otherwise try instrument_name
  const instrumentCollection = getCollection<any>('instruments');
  let resolvedInstrumentId: ObjectId | undefined;
  if (input.instrument_id) {
    resolvedInstrumentId = new ObjectId(String(input.instrument_id));
  } else if (input.instrument_name) {
    const instrument = await instrumentCollection.findOne({
      $or: [
        { instrument_name: input.instrument_name },
        { name: input.instrument_name }
      ]
    });
    if (!instrument) {
      return {
        success: false,
        error: `Instrument with name not found`,
        statusCode: 400
      };
    }
    console.log('Resolved instrument by name:', { instrumentId: instrument._id });
    resolvedInstrumentId = instrument._id instanceof ObjectId ? instrument._id : new ObjectId(String(instrument._id));
  }

  // ✅ 2. Generate order number & barcode
  const orderNumber = `ORD-${Date.now()}`;
  const barcode = `BC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // ✅ 3. Normalize createdBy
  const createdById = createdBy instanceof ObjectId ? createdBy : new ObjectId(String(createdBy));

  // ✅ 4. Build document (lưu patient_id, không lưu email)
  const newOrder: ITestOrder = {
    order_number: orderNumber,
    patient_id: new ObjectId(patient._id),  // 👈 gán id từ bệnh nhân tìm được
    instrument_id: resolvedInstrumentId,
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

  try {
    // ✅ 5. Insert vào DB
    const result = await collection.insertOne(newOrder as unknown as TestOrderDocument);
    if (!result.insertedId) {
      console.error('Insert failed - no insertedId returned');
      return {
        success: false,
        error: "Failed to create test order",
        statusCode: 500
      };
    }

    // ✅ 6. Lấy lại document vừa insert để verify và return
    const inserted = await collection.findOne({ _id: result.insertedId });
    if (!inserted) {
      console.error('Insert succeeded but document not found after insert', { insertedId: result.insertedId });
      return {
        success: false,
        error: "Failed to create test order: document not found after insert",
        statusCode: 500
      };
    }


    return {
      success: true,
      data: inserted as TestOrderDocument
    };
  } catch (err) {
    console.error('DB error creating test order:', err);
    return {
      success: false,
      error: "Failed to create test order",
      statusCode: 500
    };
  }
};

export const getAllTestOrders = async (): Promise<any[]> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);

  const items = await collection
    .aggregate([
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient_info"
        }
      },
      {
        $unwind: {
          path: "$patient_info",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "created_by_user"
        }
      },
      {
        $unwind: {
          path: "$created_by_user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "run_by",
          foreignField: "_id",
          as: "run_by_user"
        }
      },
      {
        $unwind: {
          path: "$run_by_user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          patient_email: "$patient_info.email",
          patient_name: "$patient_info.full_name",
          patient_gender: "$patient_info.gender",
          patient_phone: "$patient_info.phone_number",
          created_by_name: "$created_by_user.full_name",
          run_by_name: "$run_by_user.full_name"
        }
      },
      {
        $project: {
          patient_info: 0,
          created_by_user: 0,
          run_by_user: 0
        }
      },
      {
        $sort: { created_at: -1 }  // Sort by most recent first (descending)
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
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "created_by_user"
          }
        },
        {
          $unwind: {
            path: "$created_by_user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "run_by",
            foreignField: "_id",
            as: "run_by_user"
          }
        },
        {
          $unwind: {
            path: "$run_by_user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            patient_email: "$patient_info.email",
            patient_name: "$patient_info.full_name",
            patient_gender: "$patient_info.gender",
            patient_phone: "$patient_info.phone_number",
            created_by_name: "$created_by_user.full_name",
            run_by_name: "$run_by_user.full_name"
          }
        },
        {
          $project: {
            patient_info: 0,
            created_by_user: 0,
            run_by_user: 0
          }
        }
      ])
      .toArray();

    return result[0] || null;
  } catch (err) {
    return null;
  }
};


export const updateTestOrder = async (
  id: string,
  data: UpdateTestOrderWithPatientInput
): Promise<TestOrderDocument | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const patientCollection = getCollection<any>(PATIENT_COLLECTION);
  const now = new Date();

  try {
    const _id = new ObjectId(id);
    
    // Get test order to access patient_id (outside transaction for initial check)
    const testOrder = await collection.findOne({ _id });
    if (!testOrder) {
      return null;
    }

    // Separate patient fields from test order fields
    const patientFields = ['full_name', 'date_of_birth', 'gender', 'phone_number', 'address'];
    const patientUpdateData: any = {};
    const testOrderUpdateData: any = { updated_at: now };

    Object.keys(data).forEach((key) => {
      if (patientFields.includes(key)) {
        patientUpdateData[key] = (data as any)[key];
      } else if (key !== '_id') {
        testOrderUpdateData[key] = (data as any)[key];
      }
    });

    // Check if updates are needed
    const hasPatientUpdates = Object.keys(patientUpdateData).length > 0 && testOrder.patient_id;
    const hasOrderUpdates = Object.keys(testOrderUpdateData).length > 1; // More than just updated_at

    if (!hasPatientUpdates && !hasOrderUpdates) {
      // No updates needed, return current order
      return testOrder as TestOrderDocument;
    }

    // Execute updates within transaction: update Patient + update TestOrder atomically
    await withTransaction(async (session) => {
      // Update patient info if any patient fields provided
      if (hasPatientUpdates) {
        await patientCollection.updateOne(
          { _id: new ObjectId(String(testOrder.patient_id)) },
          { 
            $set: { 
              ...patientUpdateData, 
              updated_at: now,
              updated_by: testOrder.updated_by  // Keep the last updater for patient
            } 
          },
          { session }
        );
      }

      // Update test order
      if (hasOrderUpdates) {
        await collection.updateOne(
          { _id },
          { $set: testOrderUpdateData },
          { session }
        );
      }
    });

    // Fetch updated order
    const updated = await collection.findOne({ _id });
    return updated as TestOrderDocument | null;
  } catch (err) {
    console.error('Error updating test order:', err);
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
};

// Comment Management (3.5.3)

export const addComment = async (
  orderId: string,
  commentText: string,
  createdBy: ObjectId
): Promise<TestOrderDocument | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const now = new Date();

  try {
    const _id = new ObjectId(orderId);

    // Create comment object
    const newComment = {
      comment_text: commentText,
      created_by: createdBy,
      created_at: now,
      updated_at: now,
      updated_by: createdBy
    };

    // Add comment to comments array
    await collection.updateOne(
      { _id },
      { 
        $push: { comments: newComment },
        $set: { updated_at: now, updated_by: createdBy }
      }
    );

    const updated = await collection.findOne({ _id });
    return updated as TestOrderDocument | null;
  } catch (err) {
    return null;
  }
};

export const updateComment = async (
  orderId: string,
  commentIndex: number,
  commentText: string,
  updatedBy: ObjectId
): Promise<TestOrderDocument | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const now = new Date();

  try {
    const _id = new ObjectId(orderId);

    // Update specific comment in array by index
    const updateField = `comments.${commentIndex}`;
    await collection.updateOne(
      { _id },
      { 
        $set: { 
          [`${updateField}.comment_text`]: commentText,
          [`${updateField}.updated_at`]: now,
          [`${updateField}.updated_by`]: updatedBy,
          updated_at: now,
          updated_by: updatedBy
        }
      }
    );

    const updated = await collection.findOne({ _id });
    return updated as TestOrderDocument | null;
  } catch (err) {
    return null;
  }
};

export const deleteComment = async (
  orderId: string,
  commentIndex: number,
  deletedBy: ObjectId
): Promise<TestOrderDocument | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const now = new Date();

  try {
    const _id = new ObjectId(orderId);

    // Soft delete: set deleted_at field on specific comment
    const updateField = `comments.${commentIndex}`;
    await collection.updateOne(
      { _id },
      { 
        $set: { 
          [`${updateField}.deleted_at`]: now,
          updated_at: now,
          updated_by: deletedBy
        }
      }
    );

    const updated = await collection.findOne({ _id });
    return updated as TestOrderDocument | null;
  } catch (err) {
    return null;
  }
};

// Process Sample API (3.6.1.2)
export const processSample = async (
  barcode: string,
  instrumentId: string,
  createdBy: ObjectId
): Promise<{ order: TestOrderDocument; isNew: boolean } | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const instrumentCollection = getCollection<any>('instruments');
  const reagentCollection = getCollection<any>('instrument_reagents');
  const now = new Date();

  try {
    // 1. Check if test order exists with barcode
    let existingOrder = await collection.findOne({ barcode });
    
    if (existingOrder) {
      return { order: existingOrder as TestOrderDocument, isNew: false };
    }

    // 2. Check instrument mode = 'ready'
    const instrument = await instrumentCollection.findOne({ _id: new ObjectId(instrumentId) });
    if (!instrument) {
      throw new Error('Instrument not found');
    }

    if (instrument.mode !== 'ready') {
      throw new Error(`Instrument is not ready (current mode: ${instrument.mode || 'not set'})`);
    }

    // 3. Check reagent levels
    const reagents = await reagentCollection.find({
      instrument_id: new ObjectId(instrumentId),
      status: 'in_use'
    }).toArray();

    if (reagents.length === 0) {
      throw new Error('No active reagents found for this instrument');
    }

    // Check if any reagent has insufficient quantity
    const insufficientReagents = reagents.filter((r: any) => r.quantity_remaining <= 0);
    if (insufficientReagents.length > 0) {
      throw new Error('Insufficient reagent levels');
    }

    // 4. Auto-create test order
    const orderNumber = `ORD-${Date.now()}`;
    
    const newOrder: ITestOrder = {
      order_number: orderNumber,
      patient_id: new ObjectId('000000000000000000000000'), // Placeholder, needs to be matched later
      instrument_id: new ObjectId(instrumentId),
      barcode,
      status: 'pending',
      test_results: [],
      comments: [],
      run_by: undefined,
      run_at: undefined,
      created_at: now,
      created_by: createdBy,
      updated_at: now,
      updated_by: createdBy
    };

    const result = await collection.insertOne(newOrder as TestOrderDocument);
    const inserted = await collection.findOne({ _id: result.insertedId });

    if (!inserted) {
      throw new Error('Failed to create test order');
    }

    return { order: inserted as TestOrderDocument, isNew: true };
  } catch (err) {
    console.error('Error in processSample:', err);
    return null;
  }
};

// Add Test Results with Flagging (Step 17)
export const addTestResults = async (
  orderId: string,
  results: Array<{ parameter_id: string; result_value: number; unit: string }>,
  updatedBy: ObjectId
): Promise<TestOrderDocument | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const parameterCollection = getCollection<any>('parameters');
  const now = new Date();

  try {
    const _id = new ObjectId(orderId);

    // Process each result with flagging logic
    const processedResults = await Promise.all(
      results.map(async (r) => {
        const parameter = await parameterCollection.findOne({ _id: new ObjectId(r.parameter_id) });
        
        if (!parameter) {
          throw new Error(`Parameter ${r.parameter_id} not found`);
        }

        // Simple flagging logic based on normal_range
        let is_flagged = false;
        let reference_range_text = '';

        if (parameter.normal_range) {
          const range = parameter.normal_range;
          
          // Check if out of range
          if (range.min !== undefined && range.max !== undefined) {
            is_flagged = r.result_value < range.min || r.result_value > range.max;
            reference_range_text = range.text || `${range.min}-${range.max} ${r.unit}`;
          }
        }

        return {
          parameter_id: new ObjectId(r.parameter_id),
          result_value: r.result_value,
          unit: r.unit,
          reference_range_text,
          is_flagged,
          measured_at: now
        };
      })
    );

    // Add results to test order
    await collection.updateOne(
      { _id },
      {
        $push: { test_results: { $each: processedResults } },
        $set: { status: 'running', updated_at: now, updated_by: updatedBy }
      }
    );

    const updated = await collection.findOne({ _id });
    return updated as TestOrderDocument | null;
  } catch (err) {
    console.error('Error in addTestResults:', err);
    return null;
  }
};

// Complete Test Order with Reagent Tracking (Step 18)
export const completeTestOrder = async (
  orderId: string,
  runBy: ObjectId,
  reagentUsage?: Array<{ reagent_lot_number: string; quantity_used: number }>
): Promise<TestOrderDocument | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const reagentCollection = getCollection<any>('instrument_reagents');
  const usageHistoryCollection = getCollection<any>('reagent_usage_history');
  const now = new Date();

  try {
    const _id = new ObjectId(orderId);

    // Get order first (outside transaction for initial checks)
    const order = await collection.findOne({ _id });
    if (!order) {
      throw new Error('Test order not found');
    }

    if (order.status === 'completed') {
      throw new Error('Test order already completed');
    }

    // Execute within transaction: update TestOrder status + update InstrumentReagent quantity + insert ReagentUsageHistory
    // Transaction ensures all operations succeed or fail together
    await withTransaction(async (session) => {
      // Update order status
      await collection.updateOne(
        { _id },
        {
          $set: {
            status: 'completed',
            run_by: runBy,
            run_at: now,
            updated_at: now,
            updated_by: runBy
          }
        },
        { session }
      );

      // Track reagent usage if provided
      if (reagentUsage && reagentUsage.length > 0 && order.instrument_id) {
        for (const usage of reagentUsage) {
          // Find reagent (within transaction)
          const reagent = await reagentCollection.findOne(
            {
              reagent_lot_number: usage.reagent_lot_number,
              instrument_id: order.instrument_id
            },
            { session }
          );

          if (reagent) {
            // Update quantity_remaining (within transaction)
            await reagentCollection.updateOne(
              { _id: reagent._id },
              {
                $inc: { quantity_remaining: -usage.quantity_used }
              },
              { session }
            );

            // Create usage history (within transaction)
            await usageHistoryCollection.insertOne({
              reagent_lot_number: usage.reagent_lot_number,
              instrument_id: order.instrument_id,
              test_order_id: _id,
              quantity_used: usage.quantity_used,
              used_by: runBy,
              used_at: now,
              created_at: now,
              created_by: runBy
            }, { session });
          }
        }
      }
    });

    // Fetch updated order
    const updated = await collection.findOne({ _id });
    return updated as TestOrderDocument | null;
  } catch (err) {
    console.error('Error in completeTestOrder:', err);
    return null;
  }
};

// Excel Export (Step 23) - 3.5.4.1
export const exportToExcel = async (filters: {
  month?: string;
  status?: string;
  patient_name?: string;
}): Promise<Buffer> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const patientCollection = getCollection<any>('patients');
  const userCollection = getCollection<any>('users');

  try {
    // Build query
    const query: any = {};
    
    // Default: current month if no filters
    if (!filters.month && !filters.status && !filters.patient_name) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      query.created_at = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (filters.month) {
      // Parse month (format: YYYY-MM)
      const [year, month] = filters.month.split('-').map(Number);
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      query.created_at = { $gte: startOfMonth, $lte: endOfMonth };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const orders = await collection.find(query).sort({ created_at: -1 }).toArray();

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Orders');

    // Define columns (3.5.4.1)
    worksheet.columns = [
      { header: 'Id Test Orders', key: 'id', width: 30 },
      { header: 'Patient Name', key: 'patient_name', width: 25 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Date of Birth', key: 'dob', width: 15 },
      { header: 'Phone Number', key: 'phone', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created By', key: 'created_by', width: 20 },
      { header: 'Created On', key: 'created_on', width: 20 },
      { header: 'Run By', key: 'run_by', width: 20 },
      { header: 'Run On', key: 'run_on', width: 20 }
    ];

    // Add data
    for (const order of orders) {
      const patient = await patientCollection.findOne({ _id: order.patient_id });
      const createdBy = await userCollection.findOne({ _id: order.created_by });
      let runBy = null;
      if (order.run_by) {
        runBy = await userCollection.findOne({ _id: order.run_by });
      }

      worksheet.addRow({
        id: order._id?.toString(),
        patient_name: patient?.full_name || 'N/A',
        gender: patient?.gender || 'N/A',
        dob: patient?.DOB ? new Date(patient.DOB).toLocaleDateString() : 'N/A',
        phone: patient?.phone || 'N/A',
        status: order.status,
        created_by: createdBy?.full_name || 'N/A',
        created_on: order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A',
        run_by: order.status === 'completed' && runBy ? runBy.full_name : '',
        run_on: order.status === 'completed' && order.run_at ? new Date(order.run_at).toLocaleString() : ''
      });
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  } catch (err) {
    console.error('Error in exportToExcel:', err);
    throw new Error('Failed to export to Excel');
  }
};

// PDF Print (Step 24) - 3.5.4.2
export const printToPDF = async (orderId: string): Promise<string> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const patientCollection = getCollection<any>('patients');
  const userCollection = getCollection<any>('users');

  try {
    const _id = new ObjectId(orderId);
    const order = await collection.findOne({ _id });

    if (!order) {
      throw new Error('Test order not found');
    }

    if (order.status !== 'completed') {
      throw new Error('Test order must be completed to print');
    }

    const patient = await patientCollection.findOne({ _id: order.patient_id });
    const createdBy = await userCollection.findOne({ _id: order.created_by });
    const runBy = order.run_by ? await userCollection.findOne({ _id: order.run_by }) : null;

    // Generate HTML for PDF (simplified for MVP)
    // In production, use libraries like pdfkit or puppeteer for proper PDF generation
    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h2 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Test Order Report</h1>
        
        <h2>Order Information</h2>
        <table>
          <tr><th>Id Test Orders</th><td>${order._id}</td></tr>
          <tr><th>Patient Name</th><td>${patient?.full_name || 'N/A'}</td></tr>
          <tr><th>Gender</th><td>${patient?.gender || 'N/A'}</td></tr>
          <tr><th>Date of Birth</th><td>${patient?.DOB ? new Date(patient.DOB).toLocaleDateString() : 'N/A'}</td></tr>
          <tr><th>Phone Number</th><td>${patient?.phone || 'N/A'}</td></tr>
          <tr><th>Status</th><td>${order.status}</td></tr>
          <tr><th>Created By</th><td>${createdBy?.full_name || 'N/A'}</td></tr>
          <tr><th>Created On</th><td>${order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</td></tr>
          <tr><th>Run By</th><td>${runBy?.full_name || 'N/A'}</td></tr>
          <tr><th>Run On</th><td>${order.run_at ? new Date(order.run_at).toLocaleString() : 'N/A'}</td></tr>
        </table>

        <h2>Test Results</h2>
        <table>
          <tr>
            <th>Parameter</th>
            <th>Result Value</th>
            <th>Unit</th>
            <th>Reference Range</th>
            <th>Flagged</th>
          </tr>
          ${order.test_results?.map(r => `
            <tr>
              <td>${r.parameter_id}</td>
              <td>${r.result_value}</td>
              <td>${r.unit}</td>
              <td>${r.reference_range_text || 'N/A'}</td>
              <td>${r.is_flagged ? '⚠️ Yes' : 'No'}</td>
            </tr>
          `).join('') || '<tr><td colspan="5">No results</td></tr>'}
        </table>

        <h2>Comments</h2>
        <table>
          <tr><th>Comment</th><th>Created By</th><th>Created At</th></tr>
          ${order.comments?.map(c => `
            <tr>
              <td>${c.comment_text}</td>
              <td>${c.created_by}</td>
              <td>${c.created_at ? new Date(c.created_at).toLocaleString() : 'N/A'}</td>
            </tr>
          `).join('') || '<tr><td colspan="3">No comments</td></tr>'}
        </table>
      </body>
      </html>
    `;

    // Return HTML (in production, convert to PDF using puppeteer or similar)
    return html;
  } catch (err) {
    console.error('Error in printToPDF:', err);
    throw new Error('Failed to generate PDF');
  }
};
