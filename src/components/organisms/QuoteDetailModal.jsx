import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import ApperIcon from '@/components/ApperIcon';
import { quoteService } from '@/services/api/quoteService';

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
    Tags: ''
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
          Tags: ''
        });
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-update Name field based on customer name
    if (field === 'customer_name_c' && value) {
      setFormData(prev => ({
        ...prev,
        Name: `Quote - ${value}`
      }));
    }
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
    
    const amount = parseFloat(formData.total_amount_c);
    if (isNaN(amount) || amount < 0) {
      errors.push('Valid total amount is required');
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

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount *
            </label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount_c}
                onChange={(e) => handleInputChange('total_amount_c', e.target.value)}
                placeholder="0.00"
              />
            ) : (
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(quote?.total_amount_c)}
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
              <Button
                onClick={handleSave}
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
                    {isCreateMode ? 'Create Quote' : 'Save Changes'}
                  </>
                )}
              </Button>
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