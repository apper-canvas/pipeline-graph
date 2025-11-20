import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import LineItemsManager from "@/components/organisms/LineItemsManager";
import { quoteService } from "@/services/api/quoteService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";

export default function QuoteDetailModal({ isOpen, onClose, quote, onQuoteUpdate }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({
    Name: '',
    quote_number_c: '',
    customer_name_c: '',
    quote_date_c: '',
    expiration_date_c: '',
    total_amount_c: '',
    status_c: 'Draft',
    subtotal_c: 0,
    tax_percent_c: 0,
    discounts_c: 0,
    grand_total_c: 0,
    notes_terms_c: '',
    Tags: ''
  });
  const [lineItems, setLineItems] = useState([]);
  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal_c: 0,
    tax_amount: 0,
    grand_total_c: 0
  });

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Expired', label: 'Expired' }
  ];

const isCreateMode = !quote;

  useEffect(() => {
    if (isOpen) {
      if (quote) {
        // Edit mode - populate form with quote data
        setFormData({
Name: quote.Name || '',
          quote_number_c: quote.quote_number_c || '',
          customer_name_c: quote.customer_name_c || '',
          quote_date_c: quote.quote_date_c || '',
          expiration_date_c: quote.expiration_date_c || '',
          total_amount_c: quote.total_amount_c || '',
          status_c: quote.status_c || 'Draft',
          subtotal_c: quote.subtotal_c || 0,
          tax_percent_c: quote.tax_percent_c || 0,
          discounts_c: quote.discounts_c || 0,
          grand_total_c: quote.grand_total_c || 0,
          notes_terms_c: quote.notes_terms_c || '',
          Tags: quote.Tags || ''
        });
        setIsEditing(false);
      } else {
        // Create mode - reset form
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const expirationDate = nextMonth.toISOString().split('T')[0];
        
        setFormData({
          Name: '',
          quote_number_c: generateQuoteNumber(),
          customer_name_c: '',
          quote_date_c: today,
expiration_date_c: expirationDate,
          total_amount_c: '',
          status_c: 'Draft',
          subtotal_c: 0,
          tax_percent_c: 0,
          discounts_c: 0,
          grand_total_c: 0,
          notes_terms_c: '',
          Tags: ''
        });
        setLineItems([]);
        setIsEditing(true);
      }
      setError(null);
    }
  }, [isOpen, quote]);

  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q-${year}-${randomNum}`;
  };

const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update Name field based on customer name
      if (field === 'customer_name_c' && value) {
        updated.Name = `Quote - ${value}`;
      }

      // Recalculate totals when tax or discount changes
      if (field === 'tax_percent_c' || field === 'discounts_c') {
        const totals = quoteService.calculateTotals(
          lineItems, 
          field === 'tax_percent_c' ? parseFloat(value) || 0 : updated.tax_percent_c,
          field === 'discounts_c' ? parseFloat(value) || 0 : updated.discounts_c
        );
        updated.subtotal_c = totals.subtotal_c;
        updated.grand_total_c = totals.grand_total_c;
        updated.total_amount_c = totals.grand_total_c;
        setCalculatedTotals(totals);
      }

      return updated;
    });
  };

  const handleLineItemsChange = (subtotal, items) => {
    setLineItems(items);
    const totals = quoteService.calculateTotals(
      items, 
      parseFloat(formData.tax_percent_c) || 0,
      parseFloat(formData.discounts_c) || 0
    );
    
    setCalculatedTotals(totals);
    setFormData(prev => ({
      ...prev,
      subtotal_c: totals.subtotal_c,
      grand_total_c: totals.grand_total_c,
      total_amount_c: totals.grand_total_c
    }));
  };

const validateForm = () => {
    const errors = [];
    
    if (!formData.quote_number_c?.trim()) {
      errors.push('Quote number is required');
    }
    
    if (!formData.customer_name_c?.trim()) {
      errors.push('Customer name is required');
    }
    
    if (!formData.quote_date_c) {
      errors.push('Quote date is required');
    }
    
    if (!formData.expiration_date_c) {
      errors.push('Expiration date is required');
    }
    
    if (formData.quote_date_c && formData.expiration_date_c) {
      if (new Date(formData.expiration_date_c) <= new Date(formData.quote_date_c)) {
        errors.push('Expiration date must be after quote date');
      }
    }

    const taxPercent = parseFloat(formData.tax_percent_c);
    if (taxPercent < 0 || taxPercent > 100) {
      errors.push('Tax percentage must be between 0 and 100');
    }

    const discounts = parseFloat(formData.discounts_c);
    if (discounts < 0) {
      errors.push('Discounts cannot be negative');
    }
    return errors;
  };

const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let result;
      if (isCreateMode) {
        result = await quoteService.create(formData);
      } else {
        result = await quoteService.update(quote.Id, formData);
      }

      if (result) {
        toast.success(isCreateMode ? 'Quote created successfully' : 'Quote updated successfully');
        onQuoteUpdate();
      }
    } catch (err) {
      setError(err.message || 'Failed to save quote');
      console.error('Error saving quote:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsDraft = async () => {
    // Ensure status is Draft
    setFormData(prev => ({ ...prev, status_c: 'Draft' }));
    await handleSave();
  };

  const handleSendToCustomer = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one line item before sending to customer');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const dataToSave = { ...formData, status_c: 'Sent' };
      let result;
      
      if (isCreateMode) {
        result = await quoteService.create(dataToSave);
      } else {
        result = await quoteService.update(quote.Id, dataToSave);
      }

      if (result) {
        toast.success('Quote sent to customer successfully');
        onQuoteUpdate();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to send quote');
      console.error('Error sending quote:', err);
    } finally {
setSaving(false);
    }
  }

  const handleDelete = async () => {
    if (!quote || !window.confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const success = await quoteService.delete(quote.Id);
      if (success) {
        toast.success('Quote deleted successfully');
        onQuoteUpdate();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete quote');
      console.error('Error deleting quote:', err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) return (
    <Modal isOpen={isOpen} onClose={onClose} title="Loading...">
      <Loading type="modal" />
    </Modal>
  );

  if (error && !isEditing) return (
    <Modal isOpen={isOpen} onClose={onClose} title="Error">
      <ErrorView error={error} />
    </Modal>
  );

  const title = isCreateMode ? 'Create New Quote' : isEditing ? 'Edit Quote' : 'Quote Details';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="2xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ApperIcon name="AlertCircle" className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
        )}

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quote Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quote Number *
            </label>
            {isEditing ? (
              <Input
                value={formData.quote_number_c}
                onChange={(e) => handleInputChange('quote_number_c', e.target.value)}
                placeholder="Enter quote number"
              />
            ) : (
              <div className="text-sm font-medium text-primary">
                {quote?.quote_number_c || 'N/A'}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            {isEditing ? (
              <Select
                value={formData.status_c}
                onChange={(e) => handleInputChange('status_c', e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Badge variant={getStatusBadgeVariant(quote?.status_c)}>
                {quote?.status_c || 'Draft'}
              </Badge>
            )}
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            {isEditing ? (
              <Input
                value={formData.customer_name_c}
                onChange={(e) => handleInputChange('customer_name_c', e.target.value)}
                placeholder="Enter customer name"
              />
            ) : (
              <div className="text-sm text-gray-900">
                {quote?.customer_name_c || 'N/A'}
              </div>
            )}
          </div>

          {/* Quote Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quote Date *
            </label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.quote_date_c}
                onChange={(e) => handleInputChange('quote_date_c', e.target.value)}
              />
            ) : (
              <div className="text-sm text-gray-900">
                {formatDate(quote?.quote_date_c)}
              </div>
            )}
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date *
            </label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.expiration_date_c}
                onChange={(e) => handleInputChange('expiration_date_c', e.target.value)}
              />
            ) : (
              <div className="text-sm text-gray-900">
                {formatDate(quote?.expiration_date_c)}
              </div>
            )}
          </div>

          {/* Tax Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax (%)
            </label>
            {isEditing ? (
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.tax_percent_c}
                onChange={(e) => handleInputChange('tax_percent_c', e.target.value)}
                placeholder="0.00"
              />
            ) : (
              <div className="text-sm text-gray-900">
                {formData.tax_percent_c || 0}%
              </div>
            )}
          </div>

          {/* Discounts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discounts
            </label>
            {isEditing ? (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.discounts_c}
                onChange={(e) => handleInputChange('discounts_c', e.target.value)}
                placeholder="0.00"
              />
            ) : (
              <div className="text-sm text-gray-900">
                {formatCurrency(formData.discounts_c)}
              </div>
            )}
          </div>

{/* Notes/Terms */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes & Terms
            </label>
            {isEditing ? (
              <textarea
                value={formData.notes_terms_c}
                onChange={(e) => handleInputChange('notes_terms_c', e.target.value)}
                placeholder="Enter notes or terms for this quote"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {quote?.notes_terms_c || 'None'}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            {isEditing ? (
              <Input
                value={formData.Tags}
                onChange={(e) => handleInputChange('Tags', e.target.value)}
                placeholder="Enter tags (comma separated)"
              />
            ) : (
              <div className="text-sm text-gray-900">
                {quote?.Tags || 'None'}
              </div>
            )}
          </div>
        </div>

        {/* Line Items Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          {(isCreateMode || isEditing) ? (
            <LineItemsManager 
              quoteId={quote?.Id}
              initialLineItems={lineItems}
              onTotalChange={handleLineItemsChange}
            />
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
              {lineItems.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Product/Service
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Unit Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {lineItems.map((item, index) => (
                          <tr key={item.Id || index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {item.product_service_c}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.description_c || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.quantity_c}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatCurrency(item.unit_price_c)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(item.total_per_line_c)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <ApperIcon name="Package" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No line items</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Totals Summary */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(calculatedTotals.subtotal_c)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({formData.tax_percent_c || 0}%):</span>
                <span className="font-medium">{formatCurrency(calculatedTotals.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discounts:</span>
                <span className="font-medium">-{formatCurrency(formData.discounts_c)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between text-base font-bold">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(calculatedTotals.grand_total_c)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        {quote && !isCreateMode && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {quote.CreatedOn ? formatDate(quote.CreatedOn) : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Modified:</span>{' '}
                {quote.ModifiedOn ? formatDate(quote.ModifiedOn) : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
<div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-gray-200">
          {!isCreateMode && !isEditing && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={saving}
              className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
            >
              {saving ? (
                <>
                  <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                  Delete Quote
                </>
              )}
            </Button>
          )}

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={isEditing ? () => setIsEditing(false) : onClose}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {isEditing ? 'Cancel' : 'Close'}
            </Button>

            {isCreateMode || isEditing ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSendToCustomer}
                  disabled={saving}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Send" className="w-4 h-4 mr-2" />
                      Send to Customer
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto"
              >
                <ApperIcon name="Edit2" className="w-4 h-4 mr-2" />
                Edit Quote
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}