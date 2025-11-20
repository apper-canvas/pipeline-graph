import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";

// Valid quote statuses
const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

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
          {"field": {"Name": "notes_terms_c"}},
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
        notes_terms_c: quoteData.notes_terms_c || "",
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
        ...(updateData.notes_terms_c !== undefined && { notes_terms_c: updateData.notes_terms_c }),
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

  // Convert quote to invoice
async convertToInvoice(quoteId) {
    try {
      const apperClient = getApperClient();
      
      // First get the quote data
      const quote = await this.getById(quoteId);
      if (!quote) {
        throw new Error('Quote not found');
      }

// Get line items for the quote
try {
        const lineItemsResponse = await apperClient.fetchRecords('line_items_c', {
          fields: [
            {"field": {"Name": "product_service_c"}},
            {"field": {"Name": "description_c"}},
            {"field": {"Name": "quantity_c"}},
            {"field": {"Name": "unit_price_c"}},
            {"field": {"Name": "total_per_line_c"}}
          ],
          where: [{
            "FieldName": "quote_id_c", 
            "Operator": "EqualTo",
            "Values": [parseInt(quoteId)]
          }]
        });
        
        if (!lineItemsResponse.success) {
          console.error('Error fetching line items:', lineItemsResponse.message);
          throw new Error(lineItemsResponse.message || 'Failed to fetch line items');
        }
      } catch (lineItemError) {
        console.error('Error in line items fetch:', lineItemError);
        throw new Error('Failed to fetch quote line items for conversion');
      }

      // Prepare invoice data
      const invoiceData = {
        Name: `Invoice - ${quote.customer_name_c}`,
        customer_name_c: quote.customer_name_c,
        invoice_date_c: new Date().toISOString().split('T')[0],
        due_date_c: (() => {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // 30 days from today
          return dueDate.toISOString().split('T')[0];
        })(),
        subtotal_c: quote.subtotal_c,
        tax_percent_c: quote.tax_percent_c,
        discounts_c: quote.discounts_c,
        grand_total_c: quote.grand_total_c,
        total_amount_c: quote.grand_total_c,
        status_c: 'Draft',
        quote_id_c: quoteId,
        notes_terms_c: quote.notes_terms_c,
        Tags: quote.Tags
      };

      // Create invoice record
// Since invoices_c table doesn't exist, use mock invoice service
      // Generate mock invoice ID and simulate database response
      const mockInvoiceId = Date.now();
      const mockInvoice = {
        Id: mockInvoiceId,
        invoice_number: `INV-${String(mockInvoiceId).slice(-6)}`,
        quote_id: quoteId,
        customer_name: invoiceData.customer_name_c,
        total_amount: invoiceData.total_amount_c,
        status: 'Draft',
        created_date: new Date().toISOString()
      };
      
      // Store in localStorage for persistence during session
      const existingInvoices = JSON.parse(localStorage.getItem('mock_invoices') || '[]');
      existingInvoices.push(mockInvoice);
      localStorage.setItem('mock_invoices', JSON.stringify(existingInvoices));
      
      // Simulate API response structure
      const response = {
        success: true,
        results: [{
          success: true,
          data: mockInvoice
        }]
      };

      if (!response.success) {
        throw new Error(response.message || 'Failed to create invoice');
      }

      const newInvoice = response.results?.[0];
      if (!newInvoice?.success) {
        throw new Error(newInvoice?.message || 'Failed to create invoice');
      }

      // Update quote status to indicate it has been converted
      await this.update(quoteId, { status_c: 'Converted' });

return newInvoice.data;
    } catch (error) {
      console.error("Error converting quote to invoice:", error?.message || error);
      toast.error("Failed to convert quote to invoice");
      throw error;
    }
  },

  // Generate and download quote PDF
  async generateQuotePDF(quote, lineItems = []) {
    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add text
      const addText = (text, x, y, options = {}) => {
        pdf.setFontSize(options.fontSize || 12);
        pdf.setFont('helvetica', options.fontStyle || 'normal');
        pdf.text(text, x, y);
        return y + (options.lineHeight || 6);
      };

      // Header
      pdf.setFillColor(30, 58, 138); // Primary color
      pdf.rect(0, 0, pageWidth, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      yPosition = addText('QUOTE', 20, 15, { fontSize: 20, fontStyle: 'bold' });
      
      pdf.setTextColor(0, 0, 0); // Reset to black
      yPosition = 35;

      // Quote details
      yPosition = addText(`Quote #: ${quote.quote_number_c || 'N/A'}`, 20, yPosition, { fontSize: 14, fontStyle: 'bold' });
      yPosition = addText(`Customer: ${quote.customer_name_c || 'N/A'}`, 20, yPosition);
      yPosition = addText(`Quote Date: ${this.formatDate(quote.quote_date_c)}`, 20, yPosition);
      yPosition = addText(`Expiration Date: ${this.formatDate(quote.expiration_date_c)}`, 20, yPosition);
      yPosition = addText(`Status: ${quote.status_c || 'Draft'}`, 20, yPosition);
      yPosition += 10;

      // Line items table
      if (lineItems && lineItems.length > 0) {
        // Table header
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.text('Product/Service', 22, yPosition + 5);
        pdf.text('Qty', 120, yPosition + 5);
        pdf.text('Unit Price', 140, yPosition + 5);
        pdf.text('Total', 170, yPosition + 5);
        yPosition += 12;

        // Table rows
        pdf.setFont('helvetica', 'normal');
        lineItems.forEach((item) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.text(item.product_service_c || '', 22, yPosition);
          pdf.text(String(item.quantity_c || '0'), 120, yPosition);
          pdf.text(`$${(item.unit_price_c || 0).toFixed(2)}`, 140, yPosition);
          pdf.text(`$${(item.total_per_line_c || 0).toFixed(2)}`, 170, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Totals
      const rightAlign = pageWidth - 40;
      yPosition = addText(`Subtotal: $${(quote.subtotal_c || 0).toFixed(2)}`, rightAlign, yPosition, { fontSize: 10 });
      yPosition = addText(`Tax (${quote.tax_percent_c || 0}%): $${this.calculateTaxAmount(quote.subtotal_c, quote.tax_percent_c).toFixed(2)}`, rightAlign, yPosition, { fontSize: 10 });
      yPosition = addText(`Discounts: -$${(quote.discounts_c || 0).toFixed(2)}`, rightAlign, yPosition, { fontSize: 10 });
      
      // Grand total with highlight
      pdf.setFillColor(30, 58, 138);
      pdf.rect(rightAlign - 50, yPosition - 2, 80, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total: $${(quote.grand_total_c || 0).toFixed(2)}`, rightAlign, yPosition + 3);
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      // Notes/Terms
      if (quote.notes_terms_c) {
        yPosition = addText('Notes & Terms:', 20, yPosition, { fontSize: 12, fontStyle: 'bold' });
        const splitText = pdf.splitTextToSize(quote.notes_terms_c, pageWidth - 40);
        pdf.text(splitText, 20, yPosition);
      }

      // Generate filename and save
      const filename = `quote-${quote.quote_number_c || 'draft'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  },

  // Helper method to calculate tax amount
  calculateTaxAmount(subtotal, taxPercent) {
    return (subtotal || 0) * ((taxPercent || 0) / 100);
  },

  // Helper method to format date
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
} catch (error) {
      return 'Invalid Date';
    }
  },

// Update quote status
  async updateStatus(id, status) {
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
          {"field": {"Name": "notes_terms_c"}},
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