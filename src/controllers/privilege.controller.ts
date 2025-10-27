import { Request, Response } from "express";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { MESSAGES } from "~/constants/messages";
import { PrivilegeService } from "~/services/privilege.service";

let privilegeService: PrivilegeService | null = null;

const getPrivilegeService = () => {
    if (!privilegeService) {
        privilegeService = new PrivilegeService();
    }
    return privilegeService;
}

export const getAllPrivileges = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getPrivilegeService().findAll();
        if (!result.success) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: MESSAGES.DB_QUERY_ERROR,
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
        throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export const getPrivilegeById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await getPrivilegeService().findById(id);
        if (!result.success) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: MESSAGES.DB_QUERY_ERROR,
                error: result.error
            });
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
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}