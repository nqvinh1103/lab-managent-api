export const testResultSchemas = {
  TestResult: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        description: 'The unique identifier of the test result'
      },
      parameter_id: {
        type: 'string',
        description: 'The ID of the test parameter'
      },
      result_value: {
        type: 'number',
        description: 'The value of the test result'
      },
      unit: {
        type: 'string',
        description: 'The unit of measurement'
      },
      reference_range_text: {
        type: 'string',
        description: 'The reference range for the test result'
      },
      is_flagged: {
        type: 'boolean',
        description: 'Whether the result is flagged for attention'
      },
      reagent_lot_number: {
        type: 'string',
        description: 'The lot number of the reagent used'
      },
      measured_at: {
        type: 'string',
        format: 'date-time',
        description: 'When the measurement was taken'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'When the result was created'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'When the result was last updated'
      },
      created_by: {
        type: 'string',
        description: 'ID of the user who created the result'
      },
      updated_by: {
        type: 'string',
        description: 'ID of the user who last updated the result'
      }
    },
    required: [
      'parameter_id',
      'result_value',
      'unit',
      'is_flagged',
      'measured_at'
    ]
  },
  UpdateTestResult: {
    type: 'object',
    properties: {
      result_value: {
        type: 'number',
        description: 'The value of the test result'
      },
      unit: {
        type: 'string',
        description: 'The unit of measurement'
      },
      reference_range_text: {
        type: 'string',
        description: 'The reference range for the test result'
      },
      is_flagged: {
        type: 'boolean',
        description: 'Whether the result is flagged for attention'
      },
      reagent_lot_number: {
        type: 'string',
        description: 'The lot number of the reagent used'
      },
      measured_at: {
        type: 'string',
        format: 'date-time',
        description: 'When the measurement was taken'
      }
    }
  }
};