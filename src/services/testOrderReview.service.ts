import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { PatientDocument } from '../models/Patient';
import { TestOrderDocument } from '../models/TestOrder';
import { logEvent } from '../utils/eventLog.helper';
import { applyFlagging } from '../utils/flagging.helper';
import { validateAdjustments } from '../utils/reviewValidation.helper';
import { AIAssessment, analyzeTestResults } from './openai.service';

const COLLECTION = 'test_orders';
const PATIENT_COLLECTION = 'patients';

/**
 * Format AI assessment into a readable comment text
 */
const formatAIAssessmentAsComment = (assessment: AIAssessment): string => {
  let comment = `[AI Review - ${assessment.overall_status.toUpperCase()}]\n\n`;
  comment += `${assessment.assessment}\n\n`;
  
  if (assessment.flagged_issues && assessment.flagged_issues.length > 0) {
    comment += `Vấn đề đáng chú ý:\n`;
    assessment.flagged_issues.forEach(issue => {
      comment += `- ${issue}\n`;
    });
    comment += `\n`;
  }
  
  if (assessment.recommendations && assessment.recommendations.length > 0) {
    comment += `Khuyến nghị:\n`;
    assessment.recommendations.forEach(rec => {
      const paramName = rec.parameter_name || rec.parameter_id;
      comment += `- ${paramName}: ${rec.reason}\n`;
    });
  }
  
  return comment.trim();
};

/**
 * Manual review of test order
 */
export const reviewTestOrder = async (
  orderId: string,
  userId: ObjectId,
  adjustments?: Array<{ parameter_id: string; result_value: number }>,
  comment?: string
): Promise<TestOrderDocument | null> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const patientCollection = getCollection<PatientDocument>(PATIENT_COLLECTION);
  const now = new Date();

  try {
    const _id = new ObjectId(orderId);

    // Get test order
    const order = await collection.findOne({ _id });
    if (!order) {
      throw new Error('Test order not found');
    }

    // Validate order status
    if (order.status !== 'completed') {
      throw new Error(`Cannot review test order with status: ${order.status}. Only 'completed' orders can be reviewed.`);
    }

    // Get patient for validation
    const patient = order.patient_id ? await patientCollection.findOne({ _id: order.patient_id }) : null;

    // Validate adjustments if provided
    if (adjustments && adjustments.length > 0) {
      const validation = await validateAdjustments(adjustments, patient);
      
      if (!validation.valid) {
        throw new Error(`Invalid adjustments: ${validation.errors.map(e => e.error).join('; ')}`);
      }

      // Update test results
      const updatedResults = order.test_results.map((result: any) => {
        const adjustment = adjustments.find(a => a.parameter_id === result.parameter_id.toString());
        
        if (adjustment) {
          // Re-apply flagging for updated value
          return {
            ...result,
            result_value: adjustment.result_value,
            // Note: Flagging will be re-applied after update
          };
        }
        
        return result;
      });

      // Re-apply flagging for updated results
      const parameterCollection = getCollection<any>('parameters');
      const processedResults = await Promise.all(
        updatedResults.map(async (result: any) => {
          const parameter = await parameterCollection.findOne({ _id: new ObjectId(result.parameter_id) });
          
          if (!parameter) {
            return result;
          }

          // Get fallback range
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

          // Re-apply flagging
          const flaggingResult = await applyFlagging(
            result.result_value,
            new ObjectId(result.parameter_id),
            patient?.gender,
            undefined,
            fallbackRange
          );

          return {
            ...result,
            reference_range_text: flaggingResult.reference_range_text,
            is_flagged: flaggingResult.is_flagged,
            flag_type: flaggingResult.flag_type,
            flagging_configuration_id: flaggingResult.flagging_configuration_id,
          };
        })
      );

      // Update order with new results
      await collection.updateOne(
        { _id },
        {
          $set: {
            test_results: processedResults,
            status: 'reviewed',
            reviewed_by: userId,
            reviewed_at: now,
            updated_at: now,
            updated_by: userId
          },
          ...(comment && comment.trim() ? {
            $push: {
              comments: {
                comment_text: comment.trim(),
                created_by: userId,
                created_at: now,
                updated_at: now,
                updated_by: userId
              }
            }
          } : {})
        }
      );
    } else {
      // No adjustments, just update status
      await collection.updateOne(
        { _id },
        {
          $set: {
            status: 'reviewed',
            reviewed_by: userId,
            reviewed_at: now,
            updated_at: now,
            updated_by: userId
          },
          ...(comment && comment.trim() ? {
            $push: {
              comments: {
                comment_text: comment.trim(),
                created_by: userId,
                created_at: now,
                updated_at: now,
                updated_by: userId
              }
            }
          } : {})
        }
      );
    }

    // Log event
    await logEvent(
      'UPDATE',
      'TestOrder',
      orderId,
      userId.toString(),
      'Reviewed test order',
      {
        adjustments: adjustments?.length || 0,
        comment: comment || undefined
      }
    );

    // Fetch updated order
    const updated = await collection.findOne({ _id });
    return updated as TestOrderDocument | null;
  } catch (error) {
    console.error('Error in reviewTestOrder:', error);
    throw error;
  }
};

/**
 * AI preview of test order - Only analyzes, does not apply
 */
export const aiPreviewTestOrder = async (
  orderId: string
): Promise<{
  assessment: AIAssessment;
}> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const patientCollection = getCollection<PatientDocument>(PATIENT_COLLECTION);

  try {
    const _id = new ObjectId(orderId);

    // Get test order
    const order = await collection.findOne({ _id });
    if (!order) {
      throw new Error('Test order not found');
    }

    // Validate order status
    if (order.status !== 'completed' && order.status !== 'reviewed' && order.status !== 'ai_reviewed') {
      throw new Error(`Cannot AI preview test order with status: ${order.status}. Only 'completed', 'reviewed', or 'ai_reviewed' orders can be AI previewed.`);
    }

    // Validate order has test results
    if (!order.test_results || order.test_results.length === 0) {
      throw new Error('Test order has no test results to review');
    }

    // Get patient info
    const patient = order.patient_id ? await patientCollection.findOne({ _id: order.patient_id }) : null;

    // Call AI to analyze results
    const assessment = await analyzeTestResults(order.test_results, patient);

    // Enrich recommendations with parameter names
    if (assessment.recommendations && assessment.recommendations.length > 0) {
      const parameterCollection = getCollection<any>('parameters');
      const parameterIds = assessment.recommendations.map((rec: any) => new ObjectId(rec.parameter_id));
      const parameters = await parameterCollection.find({
        _id: { $in: parameterIds }
      }).toArray();

      const parameterMap = new Map<string, any>();
      parameters.forEach((param: any) => {
        parameterMap.set(param._id.toString(), param);
      });

      // Add parameter_name to each recommendation
      assessment.recommendations = assessment.recommendations.map((rec: any) => {
        const parameter = parameterMap.get(rec.parameter_id);
        return {
          ...rec,
          parameter_name: parameter?.parameter_name || parameter?.name || rec.parameter_id
        };
      });
    }

    return {
      assessment
    };
  } catch (error) {
    console.error('Error in aiPreviewTestOrder:', error);
    throw error;
  }
};

/**
 * AI review of test order (legacy - only analyzes, does not apply)
 * @deprecated Use aiPreviewTestOrder instead
 */
export const aiReviewTestOrder = async (
  orderId: string,
  userId: ObjectId
): Promise<{
  order: TestOrderDocument;
  assessment: AIAssessment;
}> => {
  const collection = getCollection<TestOrderDocument>(COLLECTION);
  const patientCollection = getCollection<PatientDocument>(PATIENT_COLLECTION);
  const now = new Date();

  try {
    const _id = new ObjectId(orderId);

    // Get test order
    const order = await collection.findOne({ _id });
    if (!order) {
      throw new Error('Test order not found');
    }

    // Validate order status
    if (order.status !== 'completed' && order.status !== 'reviewed' && order.status !== 'ai_reviewed') {
      throw new Error(`Cannot AI review test order with status: ${order.status}. Only 'completed', 'reviewed', or 'ai_reviewed' orders can be AI reviewed.`);
    }

    // Validate order has test results
    if (!order.test_results || order.test_results.length === 0) {
      throw new Error('Test order has no test results to review');
    }

    // Get patient info
    const patient = order.patient_id ? await patientCollection.findOne({ _id: order.patient_id }) : null;

    // Call AI to analyze results
    const assessment = await analyzeTestResults(order.test_results, patient);

    // Enrich recommendations with parameter names
    if (assessment.recommendations && assessment.recommendations.length > 0) {
      const parameterCollection = getCollection<any>('parameters');
      const parameterIds = assessment.recommendations.map((rec: any) => new ObjectId(rec.parameter_id));
      const parameters = await parameterCollection.find({
        _id: { $in: parameterIds }
      }).toArray();

      const parameterMap = new Map<string, any>();
      parameters.forEach((param: any) => {
        parameterMap.set(param._id.toString(), param);
      });

      // Add parameter_name to each recommendation
      assessment.recommendations = assessment.recommendations.map((rec: any) => {
        const parameter = parameterMap.get(rec.parameter_id);
        return {
          ...rec,
          parameter_name: parameter?.parameter_name || parameter?.name || rec.parameter_id
        };
      });
    }

    // Format assessment as comment
    const formattedComment = formatAIAssessmentAsComment(assessment);

    // Update status to ai_reviewed and add AI assessment as comment
    await collection.updateOne(
      { _id },
      {
        $set: {
          status: 'ai_reviewed',
          ai_reviewed_at: now,
          updated_at: now,
          updated_by: userId
        },
        $push: {
          comments: {
            comment_text: formattedComment,
            created_by: userId,
            created_at: now,
            updated_at: now,
            updated_by: userId
          }
        }
      }
    );

    // Log event
    await logEvent(
      'UPDATE',
      'TestOrder',
      orderId,
      userId.toString(),
      'AI reviewed test order',
      {
        assessment: assessment.overall_status,
        flagged_issues: assessment.flagged_issues
      }
    );

    // Fetch updated order
    const updated = await collection.findOne({ _id });
    if (!updated) {
      throw new Error('Failed to fetch updated test order');
    }

    return {
      order: updated as TestOrderDocument,
      assessment
    };
  } catch (error) {
    console.error('Error in aiReviewTestOrder:', error);
    throw error;
  }
};

