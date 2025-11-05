import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { PatientService } from '../services/patient.service';
import { logEvent } from '../utils/eventLog.helper';
import { handleCreateResult, handleGetResult, handleUpdateResult, sendSuccessResponse, sendErrorResponse } from '../utils/response.helper';

let patientService: PatientService | null = null;

const getPatientService = () => {
  if (!patientService) {
    patientService = new PatientService();
  }
  return patientService;
};

// Create patient
export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientData = {
      ...req.body,
      created_by: req.user?.id ? new ObjectId(req.user.id) : undefined,
      updated_by: req.user?.id ? new ObjectId(req.user.id) : undefined,
    };

    const result = await getPatientService().create(patientData);

    if (!result.success) {
      handleCreateResult(res, result);
      return;
    }

    // Return patient data with temporary password
    // TODO: Send email with credentials instead of returning in response
    const { temporaryPassword, emailSent, emailError, ...patientInfo } = result.data!;

    // Log event
    await logEvent(
      'CREATE',
      'Patient',
      patientInfo._id,
      req.user?.id,
      `Created patient: ${patientInfo.email} - ${patientInfo.full_name}`,
      { patient_id: patientInfo.email, full_name: patientInfo.full_name }
    );

    sendSuccessResponse(res, HTTP_STATUS.CREATED, 'Patient created successfully', {
      ...patientInfo,
      emailStatus: {
        sent: emailSent,
        ...(emailError && { error: emailError })
      }
    });
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to create patient'
    );
  }
};

// Get patient by ID
export const getPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getPatientService().getById(id);

    if (!result.success) {
      handleGetResult(res, result);
      return;
    }

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.SUCCESS, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to get patient'
    );
  }
};

// Get logged-in patient's own profile
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    const result = await getPatientService().getByUserId(userId);

    if (!result.success) {
      handleGetResult(res, result, {
        notFoundMessage: result.error || 'Patient profile not found'
      });
      return;
    }

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.SUCCESS, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to get profile'
    );
  }
};

// Update patient
export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    const updates = {
      ...req.body,
      updated_by: new ObjectId(req.user.id),
    };

    const result = await getPatientService().update(id, updates);

    if (!result.success) {
      handleUpdateResult(res, result);
      return;
    }

    // Log event
    const changedFields = Object.keys(req.body).filter(key => !['updated_by'].includes(key));
    await logEvent(
      'UPDATE',
      'Patient',
      id,
      req.user?.id,
      `Updated patient: ${result.data!.email} - changed: ${changedFields.join(', ')}`,
      { changed_fields: changedFields, email: result.data!.email }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, MESSAGES.UPDATED, result.data);
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to update patient'
    );
  }
};

// Delete patient (soft delete)
export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED, 'User not authenticated');
      return;
    }

    // Fetch patient info before delete
    const patientResult = await getPatientService().getById(id);
    const patientInfo = patientResult.data;

    const deletedBy = new ObjectId(req.user.id);

    const result = await getPatientService().delete(id, deletedBy);

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.BAD_REQUEST,
        result.error || MESSAGES.DB_DELETE_ERROR,
        result.error
      );
      return;
    }

    // Log event
    await logEvent(
      'DELETE',
      'Patient',
      id,
      req.user?.id,
      `Deleted patient: ${patientInfo?.email} - ${patientInfo?.full_name}`,
      { email: patientInfo?.email, full_name: patientInfo?.full_name }
    );

    sendSuccessResponse(res, HTTP_STATUS.OK, 'Patient deleted successfully');
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to delete patient'
    );
  }
};

// List patients
export const listPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await getPatientService().list({
      page,
      limit,
      search
    });

    if (!result.success) {
      sendErrorResponse(
        res,
        result.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        result.error || MESSAGES.DB_QUERY_ERROR,
        result.error
      );
      return;
    }

    sendSuccessResponse(
      res,
      HTTP_STATUS.OK,
      MESSAGES.SUCCESS,
      result.data?.patients || [],
      {
        page: result.data?.page || page,
        limit: result.data?.limit || limit,
        total: result.data?.total || 0,
        totalPages: Math.ceil((result.data?.total || 0) / (result.data?.limit || limit))
      }
    );
  } catch (error) {
    sendErrorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to list patients'
    );
  }
};

