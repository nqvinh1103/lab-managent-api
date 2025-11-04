import { ObjectId } from 'mongodb';
import { TestOrderDocument } from '../models/TestOrder';
import { PatientDocument } from '../models/Patient';
import { RawTestResult } from './testResultGenerator';

export interface HL7MessageData {
  testOrder: TestOrderDocument;
  patient: PatientDocument | null;
  instrument: any;
  rawTestResults: RawTestResult[];
}

/**
 * Generate HL7 message from test order and raw test results
 * Format: MSH, PID, OBR, OBX segments
 */
export const generateHL7Message = async (
  data: HL7MessageData
): Promise<string> => {
  const { testOrder, patient, instrument, rawTestResults } = data;
  const segments: string[] = [];
  const now = new Date();
  const messageId = `MSG${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const timestamp = formatHL7Timestamp(now);

  // MSH Segment - Message Header
  // MSH|^~\&|SendingApp|ReceivingApp|SendingFacility|ReceivingFacility|DateTime|Security|MessageType|MessageControlID|ProcessingID|VersionID|SequenceNumber|ContinuationPointer|AcceptAcknowledgmentType|ApplicationAcknowledgmentType|CountryCode|CharacterSet|PrincipalLanguageOfMessage|AlternateCharacterSetHandlingScheme
  const mshSegment = `MSH|^~\\&|${instrument?.instrument_name || 'Instrument'}|TestOrderService|Lab|Lab|${timestamp}||ORU^R01|${messageId}|P|2.3`;
  segments.push(mshSegment);

  // PID Segment - Patient Identification
  // PID|SetID|PatientID|PatientIdentifierList|AlternatePatientID|PatientName|MotherMaidenName|DateOfBirth|Sex|PatientAlias|Race|Address|PhoneNumber|PhoneNumberBusiness|PrimaryLanguage|MaritalStatus|Religion|PatientAccountNumber|SSN|DriverLicenseNumber|MotherIdentifier|EthnicGroup|BirthPlace|MultipleBirthIndicator|BirthOrder|Citizenship|VeteransMilitaryStatus|Nationality|PatientDeathDate|PatientDeathIndicator|IdentityUnknownIndicator|IdentityReliabilityCode|LastUpdateDateTime|LastUpdateFacility|SpeciesCode|BreedCode|Strain|ProductionClassCode|TribalCitizenship
  if (patient) {
    let dob = '';
    if (patient.date_of_birth) {
      // Convert to Date object if it's a string
      const dobDate = patient.date_of_birth instanceof Date 
        ? patient.date_of_birth 
        : new Date(patient.date_of_birth);
      dob = formatHL7Date(dobDate);
    }
    const gender = patient.gender ? (patient.gender === 'male' ? 'M' : 'F') : '';
    const patientName = patient.full_name || '';
    const pidSegment = `PID|1||${patient._id?.toString() || ''}||${patientName}||${dob}|${gender}|||||||||||${patient.email || ''}|||`;
    segments.push(pidSegment);
  } else {
    // Placeholder PID if patient not found
    const pidSegment = `PID|1||${testOrder.patient_id?.toString() || ''}|||||||`;
    segments.push(pidSegment);
  }

  // OBR Segment - Observation Request
  // OBR|SetID|PlacerOrderNumber|FillerOrderNumber|UniversalServiceIdentifier|Priority|RequestedDateTime|ObservationDateTime|ObservationEndDateTime|CollectionVolume|CollectorIdentifier|SpecimenActionCode|DangerCode|RelevantClinicalInfo|SpecimenReceivedDateTime|SpecimenSource|OrderingProvider|OrderCallbackPhoneNumber|PlacerField1|PlacerField2|FillerField1|FillerField2|ResultsRptStatusChngDateTime|ChargeToPractice|DiagnosticServSectID|ResultStatus|ParentResult|QuantityTiming|ResultCopiesTo|Parent|TransportationMode|ReasonForStudy|PrincipalResultInterpreter|AssistantResultInterpreter|Technician|Transcriptionist|ScheduledDateTime|NumberOfSampleContainers|TransportLogisticsOfCollectedSample|CollectorsComment|TransportArrangementResponsibility|TransportArranged|EscortRequired|PlannedPatientTransportComment|ProcedureCode|ProcedureCodeModifier|PlacerSupplementalServiceInformation|FillerSupplementalServiceInformation|MedicallyNecessaryDuplicateProcedureReason|ResultHandling|ParentUniversalServiceIdentifier
  const obrSegment = `OBR|1||${testOrder.barcode || ''}|||${timestamp}|||${testOrder.order_number || ''}|||${testOrder.instrument_id?.toString() || ''}||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||`;
  segments.push(obrSegment);

  // OBX Segments - Observation Results (one per parameter)
  // OBX|SetID|ValueType|ObservationIdentifier|ObservationSubID|ObservationValue|Units|ReferenceRange|AbnormalFlags|Probability|NatureOfAbnormalTest|ObservationResultStatus|DateLastObsNormalValues|UserDefinedAccessChecks|DateTimeOfObservation|ProducersID|ResponsibleObserver|ObservationMethod|EquipmentInstanceIdentifier|DateTimeOfAnalysis|ReservedForHarmonizationWithV2.6|ReservedForHarmonizationWithV2.7|ReservedForHarmonizationWithV2.8
  rawTestResults.forEach((result, index) => {
    const setID = index + 1;
    const valueType = 'NM'; // Numeric
    const observationIdentifier = `${result.parameter_code}^${result.parameter_code}^L`;
    const observationValue = result.result_value.toString();
    const units = result.unit || '';
    const referenceRange = result.reference_range_text || '';
    const abnormalFlags = result.is_flagged ? 'H' : 'N'; // H = High/Abnormal, N = Normal
    
    const obxSegment = `OBX|${setID}|${valueType}|${observationIdentifier}||${observationValue}|${units}|${referenceRange}|${abnormalFlags}||||F||${timestamp}|||||||`;
    segments.push(obxSegment);
  });

  // Join segments with carriage return
  return segments.join('\r');
};

/**
 * Format date to HL7 format: YYYYMMDDHHMMSS
 */
const formatHL7Timestamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Format date to HL7 format: YYYYMMDD
 * Handles both Date object and string/other formats
 */
const formatHL7Date = (date: Date | string | any): string => {
  // Convert to Date object if needed
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    // Try to convert if it's an object with date properties
    dateObj = new Date(date);
  }

  // Validate date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatHL7Date:', date);
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

