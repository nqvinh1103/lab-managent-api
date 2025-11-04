import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { FlaggingConfigurationDocument } from '../models/FlaggingConfiguration';

export interface FlaggingResult {
  is_flagged: boolean;
  flag_type?: 'critical' | 'warning' | 'info';
  flagging_configuration_id?: ObjectId; // ID of the FlaggingConfiguration that matched
  reference_range_text: string;
}

/**
 * Get flagging configurations for a parameter
 */
export const getFlaggingConfigs = async (
  parameter_id: ObjectId,
  gender?: 'male' | 'female',
  age_group?: string
): Promise<FlaggingConfigurationDocument[]> => {
  try {
    const collection = getCollection<FlaggingConfigurationDocument>('flagging_configurations');
    
    // Build query
    const query: any = {
      parameter_id: parameter_id,
      is_active: true
    };

    // Match gender if provided
    if (gender) {
      query.$or = [
        { gender: gender },
        { gender: { $exists: false } },
        { gender: null }
      ];
    } else {
      query.$or = [
        { gender: { $exists: false } },
        { gender: null }
      ];
    }

    // Match age_group if provided
    if (age_group) {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { age_group: age_group },
            { age_group: { $exists: false } },
            { age_group: null }
          ]
        }
      ];
    }

    const configs = await collection.find(query).toArray();
    
    // Sort by priority: critical > warning > info
    const priorityOrder = { critical: 1, warning: 2, info: 3 };
    return configs.sort((a, b) => {
      return (priorityOrder[a.flag_type] || 999) - (priorityOrder[b.flag_type] || 999);
    });
  } catch (error) {
    console.error('Error getting flagging configs:', error);
    return [];
  }
};

/**
 * Apply flagging logic based on flagging configurations
 */
export const applyFlagging = async (
  result_value: number,
  parameter_id: ObjectId,
  gender?: 'male' | 'female',
  age_group?: string,
  fallbackRange?: { min?: number; max?: number; text?: string }
): Promise<FlaggingResult> => {
  // Get flagging configurations
  const flaggingConfigs = await getFlaggingConfigs(parameter_id, gender, age_group);

  // If no flagging configs, use fallback range (from parameter normal_range)
  if (flaggingConfigs.length === 0) {
    if (fallbackRange && fallbackRange.min !== undefined && fallbackRange.max !== undefined) {
      const is_flagged = result_value < fallbackRange.min || result_value > fallbackRange.max;
      return {
        is_flagged,
        reference_range_text: fallbackRange.text || `${fallbackRange.min}-${fallbackRange.max}`,
        flag_type: is_flagged ? 'warning' : undefined
      };
    }
    return {
      is_flagged: false,
      reference_range_text: fallbackRange?.text || ''
    };
  }

  // Apply flagging based on configurations
  for (const config of flaggingConfigs) {
    const min = config.reference_range_min;
    const max = config.reference_range_max;

    if (min !== undefined && max !== undefined) {
      const isOutOfRange = result_value < min || result_value > max;
      
      if (isOutOfRange) {
        return {
          is_flagged: true,
          flag_type: config.flag_type,
          flagging_configuration_id: config._id,
          reference_range_text: `${min}-${max}`
        };
      }
    }
  }

  // If no config matches (within range), return not flagged
  const firstConfig = flaggingConfigs[0];
  return {
    is_flagged: false,
    reference_range_text: firstConfig.reference_range_min !== undefined && firstConfig.reference_range_max !== undefined
      ? `${firstConfig.reference_range_min}-${firstConfig.reference_range_max}`
      : ''
  };
};

