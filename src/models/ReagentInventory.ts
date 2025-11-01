import { ObjectId } from 'mongodb';

export interface IReagentInventory {
  _id?: ObjectId;
  reagent_id: ObjectId; // Reference to Reagent master (SRS 2.5)
  
  // Reagent Information (from SRS 3.3.2.1)
  catalog_number?: string;
  manufacturer?: string;
  cas_number?: string; // Chemical Abstracts Service number (if applicable)
  
  // Vendor Details
  vendor_name: string;
  vendor_id?: string;
  vendor_contact?: string;
  
  // Supply/Order Details
  po_number?: string; // Purchase Order Number
  order_date?: Date;
  receipt_date: Date;
  quantity_ordered?: number;
  quantity_received: number;
  unit_of_measure: string;
  
  // Batch Information
  lot_number: string;
  expiration_date: Date;
  
  // Warehouse Management
  quantity_in_stock: number; // Remaining quantity in warehouse
  initial_storage_location?: string;
  
  // Status
  status: 'Received' | 'Partial Shipment' | 'Returned';
  returned_reason?: string; // Required if status = "Returned"
  
  // Receiving Information
  received_by: ObjectId;
  
  // Audit fields
  created_at: Date;
  updated_at: Date;
}

export type ReagentInventoryDocument = IReagentInventory & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreateReagentInventoryInput = Omit<IReagentInventory, '_id' | 'created_at' | 'updated_at' | 'quantity_in_stock'> & {
  quantity_in_stock?: number; // Optional, defaults to quantity_received if not provided
};

export type UpdateReagentInventoryInput = Partial<Omit<IReagentInventory, '_id' | 'created_at' | 'reagent_id'>>;

export type UpdateReagentInventoryStockInput = {
  quantity_in_stock: number;
};

export type UpdateReagentInventoryStatusInput = {
  status: 'Received' | 'Partial Shipment' | 'Returned';
  returned_reason?: string;
};

