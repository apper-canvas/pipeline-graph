import { toast } from "react-toastify";
import React from "react";

class LineItemService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'line_items_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "product_service_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "quantity_c"}},
          {"field": {"Name": "unit_price_c"}},
          {"field": {"Name": "total_per_line_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{
          "fieldName": "CreatedOn",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          "limit": 100,
          "offset": 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching line items:", error?.response?.data?.message || error);
      toast.error('Failed to fetch line items');
return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "product_service_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "quantity_c"}},
          {"field": {"Name": "unit_price_c"}},
          {"field": {"Name": "total_per_line_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching line item ${id}:`, error?.response?.data?.message || error);
      toast.error('Failed to fetch line item');
return null;
    }
  }

  async create(lineItemData) {
    try {
      // Calculate total per line
      const quantity = parseFloat(lineItemData.quantity_c) || 0;
      const unitPrice = parseFloat(lineItemData.unit_price_c) || 0;
      const totalPerLine = quantity * unitPrice;

      const filteredData = {
        Name: lineItemData.Name || `${lineItemData.product_service_c} - ${quantity} units`,
        product_service_c: lineItemData.product_service_c,
        description_c: lineItemData.description_c || '',
        quantity_c: quantity,
        unit_price_c: unitPrice,
        total_per_line_c: totalPerLine,
        Tags: lineItemData.Tags || ""
      };

      // Remove empty values
      Object.keys(filteredData).forEach(key => {
        if (filteredData[key] === '' || filteredData[key] === null || filteredData[key] === undefined) {
          delete filteredData[key];
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} line items: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Line item created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating line item:", error?.response?.data?.message || error);
      toast.error('Failed to create line item');
return null;
    }
  }

  async update(id, updateData) {
    try {
      // Calculate total per line if quantity or unit price changed
      const quantity = updateData.quantity_c !== undefined ? parseFloat(updateData.quantity_c) || 0 : null;
      const unitPrice = updateData.unit_price_c !== undefined ? parseFloat(updateData.unit_price_c) || 0 : null;

      const filteredData = {
        Id: parseInt(id),
        ...(updateData.Name && { Name: updateData.Name }),
        ...(updateData.product_service_c && { product_service_c: updateData.product_service_c }),
        ...(updateData.description_c !== undefined && { description_c: updateData.description_c }),
        ...(quantity !== null && { quantity_c: quantity }),
        ...(unitPrice !== null && { unit_price_c: unitPrice }),
        ...(updateData.Tags !== undefined && { Tags: updateData.Tags })
      };

      // Calculate total if we have both values
      if (quantity !== null && unitPrice !== null) {
        filteredData.total_per_line_c = quantity * unitPrice;
      } else if (quantity !== null || unitPrice !== null) {
        // Need to fetch current values to calculate total
        const currentItem = await this.getById(id);
        if (currentItem) {
          const currentQuantity = quantity !== null ? quantity : (parseFloat(currentItem.quantity_c) || 0);
          const currentUnitPrice = unitPrice !== null ? unitPrice : (parseFloat(currentItem.unit_price_c) || 0);
          filteredData.total_per_line_c = currentQuantity * currentUnitPrice;
        }
      }

      const params = {
        records: [filteredData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} line items: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Line item updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating line item:", error?.response?.data?.message || error);
      toast.error('Failed to update line item');
      return null;
}
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} line items: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        if (successful.length > 0) {
          toast.success('Line item deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting line item:", error?.response?.data?.message || error);
      toast.error('Failed to delete line item');
      return false;
    }
  }
}

export const lineItemService = new LineItemService();