import { ObjectId, Sort } from 'mongodb';
import { getCollection } from '../config/database';
import { MESSAGES } from '../constants/messages';
import {
  CreateReagentInventoryInput,
  ReagentInventoryDocument,
  UpdateReagentInventoryInput,
  UpdateReagentInventoryStockInput,
  UpdateReagentInventoryStatusInput
} from '../models/ReagentInventory';
import { createPaginationOptions, createSortOptions, QueryResult, toObjectId } from '../utils/database.helper';

export class ReagentInventoryService {
  private getCollection() {
    return getCollection<ReagentInventoryDocument>('reagent_inventory');
  }

  async create(
    data: CreateReagentInventoryInput,
    userId: string | ObjectId
  ): Promise<QueryResult<ReagentInventoryDocument>> {
    try {
      const userObjectId = toObjectId(userId);
      if (!userObjectId) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      // Validate reagent_id exists
      const reagentId = toObjectId(data.reagent_id);
      if (!reagentId) {
        return {
          success: false,
          error: 'Invalid reagent ID format'
        };
      }

      const reagentCollection = getCollection<any>('reagents');
      const reagent = await reagentCollection.findOne({ _id: reagentId });
      if (!reagent) {
        return {
          success: false,
          error: 'Reagent not found'
        };
      }

      // Validate expiration_date is in the future
      if (data.expiration_date <= new Date()) {
        return {
          success: false,
          error: 'Expiration date must be set to a future date'
        };
      }

      // Validate quantity_received > 0
      if (data.quantity_received <= 0) {
        return {
          success: false,
          error: 'Quantity received must be greater than zero'
        };
      }

      // Set status based on quantity if not provided
      let status = data.status;
      if (!status) {
        if (data.quantity_ordered && data.quantity_received < data.quantity_ordered) {
          status = 'Partial Shipment';
        } else {
          status = 'Received';
        }
      }

      // If status is "Returned", validate returned_reason
      if (status === 'Returned' && !data.returned_reason) {
        return {
          success: false,
          error: 'returned_reason is required when status is "Returned"'
        };
      }

      // Set quantity_in_stock (defaults to quantity_received if not provided)
      // If status is "Returned", set quantity_in_stock to 0
      let quantity_in_stock: number;
      if (status === 'Returned') {
        quantity_in_stock = 0;
      } else {
        quantity_in_stock = data.quantity_in_stock !== undefined 
          ? data.quantity_in_stock 
          : data.quantity_received;
      }

      // Validate quantity_in_stock <= quantity_received
      if (quantity_in_stock > data.quantity_received) {
        return {
          success: false,
          error: 'Quantity in stock cannot exceed quantity received'
        };
      }

      const now = new Date();
      const docToInsert: Omit<ReagentInventoryDocument, '_id'> = {
        ...data,
        reagent_id: reagentId, // Use converted ObjectId
        quantity_in_stock,
        status,
        received_by: userObjectId,
        created_at: now,
        updated_at: now
      };

      const result = await this.getCollection().insertOne(docToInsert as ReagentInventoryDocument);

      if (result.insertedId) {
        const created = await this.getCollection().findOne({ _id: result.insertedId });

        return {
          success: true,
          data: created!
        };
      }

      return {
        success: false,
        error: 'Failed to create reagent inventory'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_SAVE_ERROR
      };
    }
  }

  async findById(id: string | ObjectId): Promise<QueryResult<ReagentInventoryDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid inventory ID'
        };
      }

      const inventory = await this.getCollection().findOne({ _id: objectId });

      if (!inventory) {
        return {
          success: false,
          error: 'Reagent inventory not found'
        };
      }

      return {
        success: true,
        data: inventory
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
      };
    }
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    reagent_name?: string;
    vendor_name?: string;
    lot_number?: string;
    status?: 'Received' | 'Partial Shipment' | 'Returned';
    start_date?: Date;
    end_date?: Date;
  } = {}): Promise<QueryResult<{
    inventory: ReagentInventoryDocument[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const { skip, limit: pageLimit } = createPaginationOptions(page, limit);
      const sortOptions = createSortOptions('receipt_date', -1) as Sort;

      // Build query with filters
      const query: any = {};

      if (options.reagent_name) {
        // Need to lookup reagent by name first
        const reagentCollection = getCollection<any>('reagents');
        const reagent = await reagentCollection.findOne({
          reagent_name: { $regex: options.reagent_name, $options: 'i' },
          is_active: true
        });
        if (reagent) {
          query.reagent_id = reagent._id;
        } else {
          // If reagent not found, return empty result
          return {
            success: true,
            data: {
              inventory: [],
              total: 0,
              page,
              limit: pageLimit
            }
          };
        }
      }

      if (options.vendor_name) {
        query.vendor_name = { $regex: options.vendor_name, $options: 'i' };
      }

      if (options.lot_number) {
        query.lot_number = { $regex: options.lot_number, $options: 'i' };
      }

      if (options.status) {
        query.status = options.status;
      }

      if (options.start_date || options.end_date) {
        query.receipt_date = {};
        if (options.start_date) {
          query.receipt_date.$gte = options.start_date;
        }
        if (options.end_date) {
          query.receipt_date.$lte = options.end_date;
        }
      }

      // Get total count
      const total = await this.getCollection().countDocuments(query);

      // Get inventory
      const inventory = await this.getCollection()
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit)
        .toArray();

      return {
        success: true,
        data: {
          inventory,
          total,
          page,
          limit: pageLimit
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
      };
    }
  }

  async updateStock(
    id: string | ObjectId,
    stockData: UpdateReagentInventoryStockInput
  ): Promise<QueryResult<ReagentInventoryDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid inventory ID'
        };
      }

      // Get current inventory
      const inventory = await this.getCollection().findOne({ _id: objectId });
      if (!inventory) {
        return {
          success: false,
          error: 'Reagent inventory not found'
        };
      }

      // Validate: quantity_in_stock <= quantity_received
      if (stockData.quantity_in_stock > inventory.quantity_received) {
        return {
          success: false,
          error: 'Quantity in stock cannot exceed quantity received'
        };
      }

      // Validate: quantity_in_stock >= 0
      if (stockData.quantity_in_stock < 0) {
        return {
          success: false,
          error: 'Quantity in stock cannot be negative'
        };
      }

      const result = await this.getCollection().findOneAndUpdate(
        { _id: objectId },
        {
          $set: {
            quantity_in_stock: stockData.quantity_in_stock,
            updated_at: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Failed to update inventory stock'
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_UPDATE_ERROR
      };
    }
  }

  async updateStatus(
    id: string | ObjectId,
    statusData: UpdateReagentInventoryStatusInput
  ): Promise<QueryResult<ReagentInventoryDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid inventory ID'
        };
      }

      // Validate: if status is "Returned", returned_reason is required
      if (statusData.status === 'Returned' && !statusData.returned_reason) {
        return {
          success: false,
          error: 'returned_reason is required when status is "Returned"'
        };
      }

      const updateDoc: any = {
        status: statusData.status,
        updated_at: new Date()
      };

      // If status is "Returned", set quantity_in_stock to 0
      if (statusData.status === 'Returned') {
        updateDoc.quantity_in_stock = 0;
      }

      // Add returned_reason if provided
      if (statusData.returned_reason) {
        updateDoc.returned_reason = statusData.returned_reason;
      } else if (statusData.status !== 'Returned') {
        // Clear returned_reason if status is not "Returned"
        updateDoc.returned_reason = undefined;
      }

      const result = await this.getCollection().findOneAndUpdate(
        { _id: objectId },
        { $set: updateDoc, ...(statusData.status !== 'Returned' ? { $unset: { returned_reason: '' } } : {}) },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Reagent inventory not found'
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_UPDATE_ERROR
      };
    }
  }

  async update(
    id: string | ObjectId,
    updateData: UpdateReagentInventoryInput
  ): Promise<QueryResult<ReagentInventoryDocument>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid inventory ID'
        };
      }

      // Validate expiration_date if provided
      if (updateData.expiration_date && updateData.expiration_date <= new Date()) {
        return {
          success: false,
          error: 'Expiration date must be set to a future date'
        };
      }

      // Validate quantity_received if provided
      if (updateData.quantity_received !== undefined && updateData.quantity_received <= 0) {
        return {
          success: false,
          error: 'Quantity received must be greater than zero'
        };
      }

      // If status is being updated to "Returned", validate returned_reason
      if (updateData.status === 'Returned' && !updateData.returned_reason) {
        return {
          success: false,
          error: 'returned_reason is required when status is "Returned"'
        };
      }

      const updateDoc = {
        ...updateData,
        updated_at: new Date()
      };

      // If status is "Returned", set quantity_in_stock to 0
      if (updateData.status === 'Returned') {
        updateDoc.quantity_in_stock = 0;
      }

      const result = await this.getCollection().findOneAndUpdate(
        { _id: objectId },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Reagent inventory not found'
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_UPDATE_ERROR
      };
    }
  }

  async validateForInstallation(
    id: string | ObjectId,
    quantity: number
  ): Promise<QueryResult<boolean>> {
    try {
      const objectId = toObjectId(id);
      if (!objectId) {
        return {
          success: false,
          error: 'Invalid inventory ID'
        };
      }

      const inventory = await this.getCollection().findOne({ _id: objectId });

      if (!inventory) {
        return {
          success: false,
          error: 'Reagent inventory not found'
        };
      }

      // Validate status
      if (inventory.status === 'Returned') {
        return {
          success: false,
          error: 'Cannot install reagent with status "Returned"'
        };
      }

      // Validate quantity_in_stock
      if (inventory.quantity_in_stock < quantity) {
        return {
          success: false,
          error: `Insufficient stock. Available: ${inventory.quantity_in_stock}, Requested: ${quantity}`
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.DB_QUERY_ERROR
      };
    }
  }
}

