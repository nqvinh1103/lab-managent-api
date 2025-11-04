import * as ExcelJS from "exceljs";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database";
import {
  CreateTestOrderInput,
  ITestOrder,
  TestOrderDocument,
  UpdateTestOrderWithPatientInput
} from "../models/TestOrder";
import { QueryResult, toObjectId } from "../utils/database.helper";
import { applyFlagging } from "../utils/flagging.helper";
import { generateHL7Message } from "../utils/hl7.generator";
import { parseHL7Message } from "../utils/hl7.parser";
import { getReagentValidationErrorMessage, validateRequiredReagents } from "../utils/reagent.helper";
import { generateRawTestResults } from "../utils/testResultGenerator";
import { withTransaction } from "../utils/transaction.helper";
import { ParameterService } from "./parameter.service";
import { RawTestResultService } from "./rawTestResult.service";

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
  if (!patient) {
    return {
      success: false,
      error: `Patient with email not found`,
      statusCode: 400
    };
  }

  // Check for existing pending test orders
  const existingPendingOrder = await collection.findOne({
    patient_id: new ObjectId(patient._id),
    status: "pending"
  });

  if (existingPendingOrder) {
    return {
      success: false,
      error: `Patient already has a pending test order. Please complete the existing order before creating a new one.`,
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
    let order: TestOrderDocument | undefined;
    let isNew = false;
    
    if (existingOrder) {
      order = existingOrder as TestOrderDocument;
      isNew = false;
    } else {
    // 2. Check instrument mode = 'ready'
    const instrument = await instrumentCollection.findOne({ _id: new ObjectId(instrumentId) });
    if (!instrument) {
      throw new Error('Instrument not found');
    }

    if (instrument.mode !== 'ready') {
      throw new Error(`Instrument is not ready (current mode: ${instrument.mode || 'not set'})`);
    }

      // 3. Check reagent levels - validate all 5 required reagent types
    const reagents = await reagentCollection.find({
      instrument_id: new ObjectId(instrumentId),
      status: 'in_use'
    }).toArray();

      // Validate that all 5 required reagent types are present and have sufficient quantity
      const validationResult = validateRequiredReagents(reagents as any[]);
      if (!validationResult.valid) {
        throw new Error(getReagentValidationErrorMessage(validationResult));
    }

    // 4. Auto-create test order and RawTestResult within transaction
    // This ensures both operations succeed or fail together
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

    // Generate HL7 data before transaction (needs order data structure)
    let hl7Message: string | null = null;
    try {
      const instrument = await instrumentCollection.findOne({ _id: new ObjectId(instrumentId) });
      if (instrument) {
        const parameterService = new ParameterService();
        const parametersResult = await parameterService.findAll(1, 1000);
        
        if (parametersResult.success && parametersResult.data && parametersResult.data.parameters.length > 0) {
          const parameters = parametersResult.data.parameters;
          const patientCollection = getCollection<any>(PATIENT_COLLECTION);
          const patient = newOrder.patient_id ? await patientCollection.findOne({ _id: newOrder.patient_id }) : null;
          const rawTestResults = generateRawTestResults(parameters, patient);
          
          if (rawTestResults.length > 0) {
            // Create temporary order document for HL7 generation
            const tempOrder: TestOrderDocument = {
              ...newOrder,
              _id: new ObjectId() // Temporary ID for HL7 generation
            } as TestOrderDocument;
            
            hl7Message = await generateHL7Message({
              testOrder: tempOrder,
              patient: patient,
              instrument: instrument,
              rawTestResults: rawTestResults
            });
          }
        }
      }
    } catch (hl7Error) {
      // Log error but don't fail - we'll create order without RawTestResult
      console.error('Error generating HL7 message before transaction:', hl7Error);
    }

    // Execute within transaction: insert TestOrder + insert RawTestResult atomically
    await withTransaction(async (session) => {
      // Insert TestOrder
      const result = await collection.insertOne(newOrder as TestOrderDocument, { session });
      
      if (!result.insertedId) {
        throw new Error('Failed to create test order');
      }

      const inserted = await collection.findOne({ _id: result.insertedId }, { session });
      if (!inserted) {
        throw new Error('Failed to retrieve created test order');
      }

      order = inserted as TestOrderDocument;
      isNew = true;

      // Insert RawTestResult if HL7 message was generated
      if (hl7Message) {
        const rawTestResultCollection = getCollection<any>('raw_test_results');
        await rawTestResultCollection.insertOne({
          test_order_id: order._id,
          barcode: barcode,
          instrument_id: new ObjectId(instrumentId),
          hl7_message: hl7Message,
          status: 'pending',
          sent_at: now,
          can_delete: false,
          created_at: now,
          created_by: createdBy
        }, { session });
      }
    });
    }

    // 5. Check instrument mode and reagents for existing orders too (before generating raw results)
    if (!isNew) {
      const instrument = await instrumentCollection.findOne({ _id: new ObjectId(instrumentId) });
      if (!instrument) {
        throw new Error('Instrument not found');
      }

      if (instrument.mode !== 'ready') {
        throw new Error(`Instrument is not ready (current mode: ${instrument.mode || 'not set'})`);
      }

      // Validate all 5 required reagent types (same as new orders)
      const reagents = await reagentCollection.find({
        instrument_id: new ObjectId(instrumentId),
        status: 'in_use'
      }).toArray();

      // Validate that all 5 required reagent types are present and have sufficient quantity
      const validationResult = validateRequiredReagents(reagents as any[]);
      if (!validationResult.valid) {
        throw new Error(getReagentValidationErrorMessage(validationResult));
      }
    }

    // 6. Generate raw test results and HL7 message (3.6.1.3) - For existing orders only
    // New orders already have RawTestResult created in transaction above
    if (!isNew && order) {
      try {
        // Get instrument for HL7 generation
        const instrument = await instrumentCollection.findOne({ _id: new ObjectId(instrumentId) });
        if (!instrument) {
          console.error('Instrument not found for HL7 generation:', instrumentId);
          return { order: order, isNew: isNew };
        }
        
        // Get all active parameters
        const parameterService = new ParameterService();
        const parametersResult = await parameterService.findAll(1, 1000); // Get all parameters
        
        if (!parametersResult.success) {
          console.error('Failed to get parameters:', parametersResult.error);
          return { order: order, isNew: isNew };
        }

        if (!parametersResult.data || parametersResult.data.parameters.length === 0) {
          console.error('No active parameters found in database');
          return { order: order, isNew: isNew };
        }

        const parameters = parametersResult.data.parameters;
        
        // Get patient for gender-specific ranges
        const patientCollection = getCollection<any>(PATIENT_COLLECTION);
        const patient = order.patient_id ? await patientCollection.findOne({ _id: order.patient_id }) : null;

        // Generate raw test results
        const rawTestResults = generateRawTestResults(parameters, patient);

        if (rawTestResults.length === 0) {
          console.error('No raw test results generated');
          return { order: order, isNew: isNew };
        }

        // Generate HL7 message
        const hl7Message = await generateHL7Message({
          testOrder: order,
          patient: patient,
          instrument: instrument,
          rawTestResults: rawTestResults
        });

        // Save to RawTestResult collection
        const rawTestResultService = new RawTestResultService();
        const createResult = await rawTestResultService.create({
          test_order_id: order._id,
          barcode: barcode,
          instrument_id: new ObjectId(instrumentId),
          hl7_message: hl7Message,
          status: 'pending',
          sent_at: now,
          can_delete: false,
          created_by: createdBy
        });

        if (!createResult.success) {
          console.error('Failed to create raw test result:', createResult.error);
        }
      } catch (hl7Error) {
        // Log error but don't fail the processSample operation
        console.error('Error generating HL7 message in processSample:', hl7Error);
      }
    }

    // Ensure order is defined before returning
    if (!order) {
      throw new Error('Failed to create or retrieve test order');
    }

    return { order: order, isNew: isNew };
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
  const patientCollection = getCollection<any>(PATIENT_COLLECTION);
  const now = new Date();

  try {
    const _id = new ObjectId(orderId);

    // Get test order to access patient_id
    const testOrder = await collection.findOne({ _id });
    if (!testOrder) {
      throw new Error('Test order not found');
    }

    // Get patient for gender/age_group (for flagging configuration)
    const patient = testOrder.patient_id ? await patientCollection.findOne({ _id: testOrder.patient_id }) : null;

    // Process each result with flagging logic using applyFlagging helper
    const processedResults = await Promise.all(
      results.map(async (r) => {
        const parameter = await parameterCollection.findOne({ _id: new ObjectId(r.parameter_id) });
        
        if (!parameter) {
          throw new Error(`Parameter ${r.parameter_id} not found`);
        }

        // Get parameter normal_range as fallback
        let fallbackRange: { min?: number; max?: number; text?: string } | undefined;
        if (parameter.normal_range) {
          const range = parameter.normal_range as any;
          if (range.male && range.female && patient?.gender) {
            const genderRange = patient.gender === 'male' ? range.male : range.female;
            fallbackRange = {
              min: genderRange.min,
              max: genderRange.max,
              text: genderRange.text || `${genderRange.min}-${genderRange.max} ${parameter.unit}`
            };
          } else if (range.min !== undefined && range.max !== undefined) {
            fallbackRange = {
              min: range.min,
              max: range.max,
              text: range.text || `${range.min}-${range.max} ${parameter.unit}`
            };
          }
        }

        // Apply flagging (3.5.2.5) - uses FlaggingConfiguration if available
        const flaggingResult = await applyFlagging(
          r.result_value,
          parameter._id,
          patient?.gender,
          undefined, // age_group - can be calculated from patient DOB if needed
          fallbackRange
        );

        return {
          parameter_id: new ObjectId(r.parameter_id),
          result_value: r.result_value,
          unit: r.unit,
          reference_range_text: flaggingResult.reference_range_text,
          is_flagged: flaggingResult.is_flagged,
          flag_type: flaggingResult.flag_type,
          flagging_configuration_id: flaggingResult.flagging_configuration_id,
          measured_at: now
        };
      })
    );

    // Add results to test order and mark order as completed
    await collection.updateOne(
      { _id },
      {
        $push: { test_results: { $each: processedResults } },
        $set: {
          status: 'completed',
          run_by: updatedBy,
          run_at: now,
          updated_at: now,
          updated_by: updatedBy
        }
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

    // Allow transitions: 'pending' → 'completed' or 'running' → 'completed'
    if (order.status !== 'pending' && order.status !== 'running') {
      throw new Error(`Cannot complete test order with status: ${order.status}. Only 'pending' or 'running' orders can be completed.`);
    }

    // Pre-validate and prepare reagent usage data (outside transaction)
    let reagentLookupMap: Map<string, any> = new Map();
    if (reagentUsage && reagentUsage.length > 0 && order.instrument_id) {
      // Ensure instrument_id is ObjectId for consistent querying
      const instrumentObjectId = toObjectId(order.instrument_id);
      if (!instrumentObjectId) {
        throw new Error('Invalid instrument ID in test order');
      }

      // Extract all reagent_lot_numbers for batch query
      const reagentLotNumbers = reagentUsage.map(u => u.reagent_lot_number);
      
      // Batch query all reagents at once (outside transaction for validation)
      const reagents = await reagentCollection.find({
        reagent_lot_number: { $in: reagentLotNumbers },
        instrument_id: instrumentObjectId,
        status: 'in_use'
      }).toArray();

      // Create lookup map for O(1) access
      reagents.forEach(reagent => {
        reagentLookupMap.set(reagent.reagent_lot_number, reagent);
      });

      // Validate all reagents exist before entering transaction
      const missingReagents: string[] = [];
      for (const usage of reagentUsage) {
        if (!reagentLookupMap.has(usage.reagent_lot_number)) {
          missingReagents.push(usage.reagent_lot_number);
        }
      }

      if (missingReagents.length > 0) {
        throw new Error(`Reagents not found or not in use for instrument: ${missingReagents.join(', ')}. Please verify reagent lot numbers.`);
      }
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
        // Ensure instrument_id is ObjectId (consistent with pre-validation)
        const instrumentObjectId = toObjectId(order.instrument_id);
        if (!instrumentObjectId) {
          throw new Error('Invalid instrument ID in test order');
        }

        for (const usage of reagentUsage) {
          // Get reagent from pre-validated lookup map
          const reagent = reagentLookupMap.get(usage.reagent_lot_number);
          
          if (!reagent) {
            // This should not happen if pre-validation passed, but check anyway
            throw new Error(`Reagent with lot number ${usage.reagent_lot_number} not found for instrument`);
          }

          // Validate quantity_remaining is sufficient
          if (reagent.quantity_remaining < usage.quantity_used) {
            throw new Error(`Insufficient quantity for reagent ${usage.reagent_lot_number}. Available: ${reagent.quantity_remaining}, Required: ${usage.quantity_used}`);
          }

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
            instrument_id: instrumentObjectId,
            test_order_id: _id,
            quantity_used: usage.quantity_used,
            used_by: runBy,
            used_at: now,
            created_at: now,
            created_by: runBy
          }, { session });
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

// Sync Raw Test Result (3.6.1.4)
export const syncRawTestResult = async (
  rawResultId: string,
  userId: ObjectId
): Promise<TestOrderDocument | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const parameterCollection = getCollection<any>('parameters');
  const patientCollection = getCollection<any>(PATIENT_COLLECTION);
  const rawTestResultService = new RawTestResultService();
  const now = new Date();

  try {
    // 1. Load RawTestResult by ID
    const rawResultResponse = await rawTestResultService.findById(rawResultId);
    if (!rawResultResponse.success || !rawResultResponse.data) {
      throw new Error('Raw test result not found');
    }

    const rawTestResult = rawResultResponse.data;

    // Check if already synced
    if (rawTestResult.status === 'synced') {
      throw new Error('Raw test result already synced');
    }

    // 2. Parse HL7 message
    const parsedHL7 = parseHL7Message(rawTestResult.hl7_message);

    // 3. Find test order by barcode
    const testOrder = await collection.findOne({ barcode: parsedHL7.order.barcode || rawTestResult.barcode });
    if (!testOrder) {
      throw new Error('Test order not found for this barcode');
    }

    // 4. Get patient for gender and age_group
    const patient = testOrder.patient_id ? await patientCollection.findOne({ _id: testOrder.patient_id }) : null;

    // 5. Process each parsed result with flagging
    const processedResults = await Promise.all(
      parsedHL7.results.map(async (parsedResult) => {
        // Find parameter by code
        const parameter = await parameterCollection.findOne({ parameter_code: parsedResult.parameter_code });
        
        if (!parameter) {
          throw new Error(`Parameter with code ${parsedResult.parameter_code} not found`);
        }

        // Get parameter normal_range as fallback
        let fallbackRange: { min?: number; max?: number; text?: string } | undefined;
        if (parameter.normal_range) {
          const range = parameter.normal_range as any;
          if (range.male && range.female && patient?.gender) {
            const genderRange = patient.gender === 'male' ? range.male : range.female;
            fallbackRange = {
              min: genderRange.min,
              max: genderRange.max,
              text: genderRange.text || `${genderRange.min}-${genderRange.max} ${parameter.unit}`
            };
          } else if (range.min !== undefined && range.max !== undefined) {
            fallbackRange = {
              min: range.min,
              max: range.max,
              text: range.text || `${range.min}-${range.max} ${parameter.unit}`
            };
          }
        }

        // Apply flagging (3.5.2.5)
        const flaggingResult = await applyFlagging(
          parsedResult.result_value,
          parameter._id,
          patient?.gender,
          undefined, // age_group - can be calculated from patient DOB if needed
          fallbackRange
        );

        return {
          parameter_id: parameter._id,
          result_value: parsedResult.result_value,
          unit: parsedResult.unit || parameter.unit,
          reference_range_text: flaggingResult.reference_range_text,
          is_flagged: flaggingResult.is_flagged,
          flag_type: flaggingResult.flag_type,
          flagging_configuration_id: flaggingResult.flagging_configuration_id,
          measured_at: now
        };
      })
    );

    // 6-7. Update TestOrder and RawTestResult within transaction
    // Ensure both operations succeed or fail together
    await withTransaction(async (session) => {
      // 6. Add results to test order and set status to 'running'
      // Status will be set to 'completed' later via completeTestOrder
      await collection.updateOne(
        { _id: testOrder._id },
        {
          $push: { test_results: { $each: processedResults } },
          $set: {
            status: 'running',
            run_by: userId,
            run_at: now,
            updated_at: now,
            updated_by: userId
          }
        },
        { session }
      );

      // 7. Update RawTestResult status
      const rawTestResultCollection = getCollection<any>('raw_test_results');
      await rawTestResultCollection.updateOne(
        { _id: new ObjectId(rawResultId) },
        {
          $set: {
            status: 'synced',
            can_delete: true,
            updated_at: now
          }
        },
        { session }
      );
    });

    // 8. Fetch updated order
    const updated = await collection.findOne({ _id: testOrder._id });
    return updated as TestOrderDocument | null;
  } catch (err) {
    console.error('Error in syncRawTestResult:', err);
    return null;
  }
};
