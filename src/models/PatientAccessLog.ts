import { ObjectId } from 'mongodb';

export interface IPatientAccessLog {
  _id?: ObjectId;
  patient_id: ObjectId;
  accessed_by: ObjectId;
  access_type: 'view' | 'create' | 'update' | 'delete';
  accessed_at: Date;
}

export type PatientAccessLogDocument = IPatientAccessLog & {
  _id: ObjectId;
  accessed_at: Date;
};

export type CreatePatientAccessLogInput = Omit<IPatientAccessLog, '_id' | 'accessed_at'>;
