import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { ParameterDocument } from '../models/Parameter';
import { PatientDocument } from '../models/Patient';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  range?: {
    min: number;
    max: number;
    text?: string;
  };
}

/**
 * Validate if a test result value is within acceptable range
 */
export const validateResultValueInRange = async (
  value: number,
  parameterId: ObjectId | string,
  patient?: PatientDocument | null
): Promise<ValidationResult> => {
  try {
    const parameterCollection = getCollection<ParameterDocument>('parameters');
    const paramObjectId = parameterId instanceof ObjectId ? parameterId : new ObjectId(parameterId);
    
    const parameter = await parameterCollection.findOne({ _id: paramObjectId });
    
    if (!parameter) {
      return {
        valid: false,
        error: `Parameter with ID ${parameterId} not found`
      };
    }

    if (!parameter.normal_range) {
      return {
        valid: true, // No range defined, assume valid
        range: undefined
      };
    }

    // Extract range based on structure
    let min: number | undefined;
    let max: number | undefined;
    let rangeText: string | undefined;

    const range = parameter.normal_range as any;

    // Check if gender-specific ranges exist
    if (range.male && range.female && patient?.gender) {
      const genderRange = patient.gender === 'male' ? range.male : range.female;
      min = genderRange.min;
      max = genderRange.max;
      rangeText = genderRange.text || `${min}-${max} ${parameter.unit}`;
    } else if (range.min !== undefined && range.max !== undefined) {
      min = range.min;
      max = range.max;
      rangeText = range.text || `${min}-${max} ${parameter.unit}`;
    }

    if (min === undefined || max === undefined) {
      return {
        valid: true, // No valid range, assume valid
        range: undefined
      };
    }

    // Validate value is within range
    if (value < min || value > max) {
      return {
        valid: false,
        error: `Value ${value} is outside acceptable range: ${rangeText}`,
        range: { min, max, text: rangeText }
      };
    }

    return {
      valid: true,
      range: { min, max, text: rangeText }
    };
  } catch (error) {
    console.error('Error validating result value:', error);
    return {
      valid: false,
      error: `Error validating value: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Validate multiple adjustments
 */
export const validateAdjustments = async (
  adjustments: Array<{ parameter_id: string; result_value: number }>,
  patient?: PatientDocument | null
): Promise<{ valid: boolean; errors: Array<{ parameter_id: string; error: string }> }> => {
  const errors: Array<{ parameter_id: string; error: string }> = [];

  for (const adjustment of adjustments) {
    const validation = await validateResultValueInRange(
      adjustment.result_value,
      adjustment.parameter_id,
      patient
    );

    if (!validation.valid) {
      errors.push({
        parameter_id: adjustment.parameter_id,
        error: validation.error || 'Invalid value'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

