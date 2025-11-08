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
  const now = new Date();

  // Filter only active reagents (in_use and not expired)
  const activeReagents = instrumentReagents.filter(r => {
    const isActive = r.status === 'in_use';
    const notExpired = !r.expiration_date || new Date(r.expiration_date) > now;
    return isActive && notExpired;
  });

  // Create map by reagent_name (should only have one per type when active)
  const reagentMap = new Map<string, InstrumentReagentDocument>();
  activeReagents.forEach(reagent => {
    const name = reagent.reagent_name;
    // If multiple exist (shouldn't happen with new business rules), use first one
    if (!reagentMap.has(name)) {
      reagentMap.set(name, reagent);
    }
  });

  // Check for missing and insufficient reagents
  for (const requiredName of REQUIRED_REAGENT_NAMES) {
    const reagent = reagentMap.get(requiredName);
    
    if (!reagent) {
      missing.push(requiredName);
    } else if (reagent.quantity_remaining <= 0) {
      insufficient.push(requiredName);
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

