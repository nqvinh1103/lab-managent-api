import { ParameterDocument } from '../models/Parameter';
import { PatientDocument } from '../models/Patient';

export interface RawTestResult {
  parameter_code: string;
  parameter_id: string;
  result_value: number;
  unit: string;
  is_flagged: boolean;
  reference_range_text?: string;
}

/**
 * Generate raw test results from parameters
 * 70% chance: value within normal range (no flag)
 * 30% chance: value outside normal range (flagged)
 * Considers gender-specific ranges for parameters like RBC, Hb, HCT
 */
export const generateRawTestResults = (
  parameters: ParameterDocument[],
  patient?: PatientDocument
): RawTestResult[] => {
  const results: RawTestResult[] = [];

  for (const parameter of parameters) {
    if (!parameter.is_active || !parameter.normal_range) {
      continue;
    }

    let min: number | undefined;
    let max: number | undefined;
    let referenceRangeText = '';

    // Handle normal_range structure
    if (typeof parameter.normal_range === 'object') {
      const range = parameter.normal_range as any;
      
      // Check if gender-specific ranges exist
      if (range.male && range.female && patient?.gender) {
        const genderRange = patient.gender === 'male' ? range.male : range.female;
        min = genderRange.min;
        max = genderRange.max;
        referenceRangeText = genderRange.text || `${min}-${max} ${parameter.unit}`;
      } else if (range.min !== undefined && range.max !== undefined) {
        min = range.min;
        max = range.max;
        referenceRangeText = range.text || `${min}-${max} ${parameter.unit}`;
      }
    }

    if (min === undefined || max === undefined) {
      // Skip if no valid range
      continue;
    }

    // Determine if this result should be flagged (30% chance)
    // Generate random value independently for each parameter
    const shouldFlag = Math.random() < 0.3;
    let resultValue: number;
    let isFlagged = false;

    if (shouldFlag) {
      // Generate value outside range (flagged)
      // 50% chance: below min, 50% chance: above max
      if (Math.random() < 0.5) {
        // Below min (20% below min)
        const deviation = (max - min) * 0.2;
        resultValue = min - Math.random() * deviation;
        isFlagged = true;
      } else {
        // Above max (20% above max)
        const deviation = (max - min) * 0.2;
        resultValue = max + Math.random() * deviation;
        isFlagged = true;
      }
    } else {
      // Generate value within range (70% chance)
      resultValue = min + Math.random() * (max - min);
      isFlagged = false;
    }

    // Round to 2 decimal places
    resultValue = Math.round(resultValue * 100) / 100;

    results.push({
      parameter_code: parameter.parameter_code,
      parameter_id: parameter._id!.toString(),
      result_value: resultValue,
      unit: parameter.unit,
      is_flagged: isFlagged,
      reference_range_text: referenceRangeText
    });
  }

  return results;
};

