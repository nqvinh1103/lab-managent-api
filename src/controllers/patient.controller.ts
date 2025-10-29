import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { PatientService } from '../services/patient.service';

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
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || MESSAGES.DB_SAVE_ERROR,
        error: result.error
      });
      return;
    }

    // Return patient data with temporary password
    // TODO: Send email with credentials instead of returning in response
    const { temporaryPassword, ...patientInfo } = result.data!;

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Patient created successfully',
      data: patientInfo,
      temporaryPassword // This should be sent via email in production
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to create patient'
    });
  }
};

// Get patient by ID
export const getPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await getPatientService().getById(id);

    if (!result.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NOT_FOUND,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get patient'
    });
  }
};

// Get logged-in patient's own profile
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const result = await getPatientService().getByUserId(userId);

    if (!result.success) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.NOT_FOUND,
        error: result.error || 'Patient profile not found'
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to get profile'
    });
  }
};

// Update patient
export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const updates = {
      ...req.body,
      updated_by: new ObjectId(req.user.id),
    };

    const result = await getPatientService().update(id, updates);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || MESSAGES.DB_UPDATE_ERROR,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.UPDATED,
      data: result.data
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to update patient'
    });
  }
};

// Delete patient (soft delete)
export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
      return;
    }

    const deletedBy = new ObjectId(req.user.id);

    const result = await getPatientService().delete(id, deletedBy);

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: result.error || MESSAGES.DB_DELETE_ERROR,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to delete patient'
    });
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
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: result.error || MESSAGES.DB_QUERY_ERROR,
        error: result.error
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.SUCCESS,
      data: result.data?.patients || [],
      pagination: {
        page: result.data?.page || page,
        limit: result.data?.limit || limit,
        total: result.data?.total || 0,
        totalPages: Math.ceil((result.data?.total || 0) / (result.data?.limit || limit))
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error instanceof Error ? error.message : 'Failed to list patients'
    });
  }
};

