/**
 * Parse HL7 message and extract structured data
 */

export interface ParsedHL7Data {
  messageType: string;
  messageId: string;
  timestamp: string;
  patient: {
    id?: string;
    name?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  order: {
    barcode?: string;
    orderNumber?: string;
    instrumentId?: string;
  };
  results: Array<{
    sequence: number;
    parameter_code: string;
    result_value: number;
    unit: string;
    reference_range?: string;
    flag: string; // H = High/Abnormal, N = Normal, L = Low
  }>;
}

/**
 * Parse HL7 message string into structured data
 */
export const parseHL7Message = (hl7Message: string): ParsedHL7Data => {
  // Split by segment delimiter (carriage return or line feed)
  const segments = hl7Message.split(/\r|\n/).filter(seg => seg.trim().length > 0);
  
  const parsed: ParsedHL7Data = {
    messageType: '',
    messageId: '',
    timestamp: '',
    patient: {},
    order: {},
    results: []
  };

  for (const segment of segments) {
    const fields = segment.split('|');
    const segmentType = fields[0];

    switch (segmentType) {
      case 'MSH':
        // MSH|^~\&|SendingApp|ReceivingApp|...|DateTime|...|MessageType|MessageControlID|...
        parsed.messageType = fields[8] || '';
        parsed.messageId = fields[9] || '';
        parsed.timestamp = fields[6] || '';
        break;

      case 'PID':
        // PID|SetID|PatientID|PatientIdentifierList|...|PatientName|...|DateOfBirth|Sex|...
        parsed.patient.id = fields[3] || fields[2] || '';
        parsed.patient.name = fields[5] || '';
        parsed.patient.dateOfBirth = fields[7] || '';
        parsed.patient.gender = fields[8] || '';
        break;

      case 'OBR':
        // OBR|SetID|...|FillerOrderNumber|...|DateTime|...|OrderNumber|...|InstrumentID|...
        parsed.order.barcode = fields[3] || '';
        parsed.order.orderNumber = fields[3] || '';
        // Instrument ID might be in different field depending on HL7 version
        parsed.order.instrumentId = fields[24] || '';
        break;

      case 'OBX':
        // OBX|SetID|ValueType|ObservationIdentifier|ObservationSubID|ObservationValue|Units|ReferenceRange|AbnormalFlags|...
        const sequence = parseInt(fields[1] || '0', 10);
        const observationIdentifier = fields[3] || '';
        // Extract parameter code from observation identifier (format: CODE^NAME^L)
        const parameterCode = observationIdentifier.split('^')[0] || '';
        const resultValue = parseFloat(fields[5] || '0');
        const unit = fields[6] || '';
        const referenceRange = fields[7] || '';
        const flag = fields[8] || 'N'; // H = High, L = Low, N = Normal

        parsed.results.push({
          sequence,
          parameter_code: parameterCode,
          result_value: resultValue,
          unit,
          reference_range: referenceRange,
          flag
        });
        break;
    }
  }

  return parsed;
};

/**
 * Extract only test results from HL7 message (for sync operation)
 */
export const extractTestResultsFromHL7 = (hl7Message: string): ParsedHL7Data['results'] => {
  const parsed = parseHL7Message(hl7Message);
  return parsed.results;
};

