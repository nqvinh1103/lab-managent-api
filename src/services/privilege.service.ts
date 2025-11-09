import { getCollection } from "~/config/database";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { PrivilegeDocument } from "~/models/Privilege";
import { QueryResult, toObjectId } from "~/utils/database.helper";

export class PrivilegeService {
    private collection = getCollection<PrivilegeDocument>('privileges');

    async findAll(): Promise<QueryResult<PrivilegeDocument[]>> {
        try {
            const privileges = await this.collection.find({}).toArray();
            return {
                success: true,
                data: privileges
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            };
        }
    }

    async findById(id: string): Promise<QueryResult<PrivilegeDocument>> {
        try {
            const objectId = toObjectId(id)
            if (!objectId) {
                return {
                    success: false,
                    error: 'Invalid privilege ID',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                };
            }

            const privilege = await this.collection.findOne({ _id: objectId });
            if (!privilege) {
                return {
                    success: false,
                    error: 'Privilege not found',
                    statusCode: HTTP_STATUS.NOT_FOUND
                };
            }
            return {
                success: true,
                data: privilege
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            };
        }
    }
}