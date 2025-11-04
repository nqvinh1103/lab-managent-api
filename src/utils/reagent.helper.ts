import { InstrumentReagentDocument } from '../models/InstrumentReagent';

/**
 * Required reagent types for blood testing (CBC - Complete Blood Count)
 * All 5 types must be installed and available on the instrument
 */
export const REQUIRED_REAGENT_NAMES = ['Diluent', 'Lysing', 'Staining', 'Clotting', 'Cleaner'] as const;

export interface ReagentValidationResult {
  valid: boolean;
  missing: string[];
  insufficient: string[];
}

/**
 * Validate that all required reagent types are installed and have sufficient quantity
 * @param instrumentReagents - Array of active instrument reagents
 * @returns Validation result with missing and insufficient reagent names
 */
export const validateRequiredReagents = (
  instrumentReagents: InstrumentReagentDocument[]
): ReagentValidationResult => {
  const missing: string[] = [];
  const insufficient: string[] = [];

  // Get installed reagent names
  const installedReagentNames = instrumentReagents.map(r => r.reagent_name);

  // Check for missing reagents
  for (const requiredName of REQUIRED_REAGENT_NAMES) {
    if (!installedReagentNames.includes(requiredName)) {
      missing.push(requiredName);
    }
  }

  // Check for insufficient quantity (quantity_remaining <= 0)
  for (const reagent of instrumentReagents) {
    if (REQUIRED_REAGENT_NAMES.includes(reagent.reagent_name as any)) {
      if (reagent.quantity_remaining <= 0) {
        insufficient.push(reagent.reagent_name);
      }
    }
  }

  return {
    valid: missing.length === 0 && insufficient.length === 0,
    missing,
    insufficient
  };
};

/**
 * Generate error message from validation result
 * @param result - Validation result
 * @returns Human-readable error message
 */
export const getReagentValidationErrorMessage = (result: ReagentValidationResult): string => {
  const messages: string[] = [];

  if (result.missing.length > 0) {
    messages.push(`Missing required reagents: ${result.missing.join(', ')}`);
  }

  if (result.insufficient.length > 0) {
    messages.push(`Insufficient quantity for reagents: ${result.insufficient.join(', ')}`);
  }

  if (messages.length > 0) {
    messages.push('Please install or refill all required reagents before processing samples.');
  }

  return messages.join(' ');
};

