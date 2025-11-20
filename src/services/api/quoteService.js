import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";

const TABLE_NAME = 'quotes_c';

// Quote Service Implementation using ApperClient
export const quoteService = {
  // Get all quotes
  async getAll() {
    try {
      const apperClient = getApperClient();
const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "quote_number_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "quote_date_c"}},
          {"field": {"Name": "expiration_date_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_percent_c"}},
          {"field": {"Name": "discounts_c"}},
          {"field": {"Name": "grand_total_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "quote_date_c", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching quotes:", error?.response?.data?.message || error);
      toast.error("Failed to fetch quotes");
      return [];
    }
  },

  // Get quote by ID
  async getById(id) {
    try {
      const apperClient = getApperClient();
const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "quote_number_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "quote_date_c"}},
          {"field": {"Name": "expiration_date_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_percent_c"}},
          {"field": {"Name": "discounts_c"}},
          {"field": {"Name": "grand_total_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to fetch quote details");
      return null;
    }
  },

  // Create new quote
  async create(quoteData) {
    try {
      const apperClient = getApperClient();
      
      // Filter only updateable fields
const filteredData = {
        Name: quoteData.Name || `Quote - ${quoteData.customer_name_c}`,
        quote_number_c: quoteData.quote_number_c,
        customer_name_c: quoteData.customer_name_c,
        quote_date_c: quoteData.quote_date_c,
        expiration_date_c: quoteData.expiration_date_c,
        total_amount_c: parseFloat(quoteData.total_amount_c) || 0,
        status_c: quoteData.status_c || 'Draft',
        subtotal_c: parseFloat(quoteData.subtotal_c) || 0,
        tax_percent_c: parseFloat(quoteData.tax_percent_c) || 0,
        discounts_c: parseFloat(quoteData.discounts_c) || 0,
        grand_total_c: parseFloat(quoteData.grand_total_c) || 0,
        Tags: quoteData.Tags || ""
      };

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} quotes:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Quote created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating quote:", error?.response?.data?.message || error);
      toast.error("Failed to create quote");
      return null;
    }
  },

  // Update existing quote
  async update(id, updateData) {
    try {
      const apperClient = getApperClient();
      
      // Filter only updateable fields
      const filteredData = {
        Id: parseInt(id),
...(updateData.Name && { Name: updateData.Name }),
        ...(updateData.quote_number_c && { quote_number_c: updateData.quote_number_c }),
        ...(updateData.customer_name_c && { customer_name_c: updateData.customer_name_c }),
        ...(updateData.quote_date_c && { quote_date_c: updateData.quote_date_c }),
        ...(updateData.expiration_date_c && { expiration_date_c: updateData.expiration_date_c }),
        ...(updateData.total_amount_c !== undefined && { total_amount_c: parseFloat(updateData.total_amount_c) || 0 }),
        ...(updateData.status_c && { status_c: updateData.status_c }),
        ...(updateData.subtotal_c !== undefined && { subtotal_c: parseFloat(updateData.subtotal_c) || 0 }),
        ...(updateData.tax_percent_c !== undefined && { tax_percent_c: parseFloat(updateData.tax_percent_c) || 0 }),
        ...(updateData.discounts_c !== undefined && { discounts_c: parseFloat(updateData.discounts_c) || 0 }),
        ...(updateData.grand_total_c !== undefined && { grand_total_c: parseFloat(updateData.grand_total_c) || 0 }),
        ...(updateData.Tags !== undefined && { Tags: updateData.Tags })
      };

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} quotes:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Quote updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating quote:", error?.response?.data?.message || error);
      toast.error("Failed to update quote");
      return null;
    }
  },

  // Delete quote
  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} quotes:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Quote deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting quote:", error?.response?.data?.message || error);
      toast.error("Failed to delete quote");
      return false;
    }
  },

  // Update quote status
async updateStatus(id, status) {
    const validStatuses = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];
    if (!validStatuses.includes(status)) {
      toast.error('Invalid status');
      return null;
    }
    
    return this.update(id, { status_c: status });
  },

  // Calculate totals based on line items and quote parameters
  calculateTotals(lineItems, taxPercent = 0, discounts = 0) {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.total_per_line_c) || 0);
    }, 0);

    const taxAmount = (subtotal * taxPercent) / 100;
    const grandTotal = subtotal + taxAmount - discounts;

    return {
      subtotal_c: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
      tax_amount: Math.round(taxAmount * 100) / 100,
      grand_total_c: Math.round(grandTotal * 100) / 100
    };
  },

  // Update quote with calculated totals
  async updateQuoteTotals(quoteId, lineItems, taxPercent = 0, discounts = 0) {
    try {
      const totals = this.calculateTotals(lineItems, taxPercent, discounts);
      
      const updateData = {
        subtotal_c: totals.subtotal_c,
        tax_percent_c: taxPercent,
        discounts_c: discounts,
        grand_total_c: totals.grand_total_c,
        total_amount_c: totals.grand_total_c // Keep total_amount_c in sync
      };

      return await this.update(quoteId, updateData);
    } catch (error) {
      console.error('Error updating quote totals:', error);
      toast.error('Failed to update quote totals');
      return null;
    }
  },

  // Search quotes
  async search(query, filters = {}) {
    try {
      const apperClient = getApperClient();
      let whereConditions = [];
      let whereGroups = [];

      // Text search
      if (query) {
        whereGroups.push({
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {
                  "fieldName": "customer_name_c",
                  "operator": "Contains",
                  "values": [query]
                }
              ],
              "operator": ""
            },
            {
              "conditions": [
                {
                  "fieldName": "quote_number_c", 
                  "operator": "Contains",
                  "values": [query]
                }
              ],
              "operator": ""
            }
          ]
        });
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        whereConditions.push({
          "FieldName": "status_c",
          "Operator": "ExactMatch",
          "Values": filters.status,
          "Include": true
        });
      }

      // Date range filter
      if (filters.startDate) {
        whereConditions.push({
          "FieldName": "quote_date_c",
          "Operator": "GreaterThanOrEqualTo",
          "Values": [filters.startDate],
          "Include": true
        });
      }

      if (filters.endDate) {
        whereConditions.push({
          "FieldName": "quote_date_c",
          "Operator": "LessThanOrEqualTo",
          "Values": [filters.endDate],
          "Include": true
        });
      }

      // Amount range filter
      if (filters.minAmount) {
        whereConditions.push({
          "FieldName": "total_amount_c",
          "Operator": "GreaterThanOrEqualTo",
          "Values": [filters.minAmount],
          "Include": true
        });
      }

      if (filters.maxAmount) {
        whereConditions.push({
          "FieldName": "total_amount_c",
          "Operator": "LessThanOrEqualTo",
          "Values": [filters.maxAmount],
          "Include": true
        });
      }

      const params = {
fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "quote_number_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "quote_date_c"}},
          {"field": {"Name": "expiration_date_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_percent_c"}},
          {"field": {"Name": "discounts_c"}},
          {"field": {"Name": "grand_total_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: whereConditions,
        whereGroups: whereGroups,
        orderBy: [{"fieldName": "quote_date_c", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error searching quotes:", error?.response?.data?.message || error);
      toast.error("Failed to search quotes");
      return [];
    }
}
};