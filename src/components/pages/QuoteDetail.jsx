import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import QuoteDetailModal from '@/components/organisms/QuoteDetailModal';
import ApperIcon from '@/components/ApperIcon';
import { quoteService } from '@/services/api/quoteService';
import { lineItemService } from '@/services/api/lineItemService';

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadQuoteDetails();
  }, [id]);

  const loadQuoteDetails = async () => {
    if (!id || isNaN(parseInt(id))) {
      setError('Invalid quote ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const quoteData = await quoteService.getById(parseInt(id));
      
      if (!quoteData) {
        setError('Quote not found');
        return;
      }

      setQuote(quoteData);

      // Load line items for this quote
      try {
        const items = await lineItemService.getByQuoteId(parseInt(id));
        setLineItems(items || []);
      } catch (err) {
        console.error('Error loading line items:', err);
        setLineItems([]);
      }

    } catch (err) {
      console.error('Error loading quote details:', err);
      setError(err.message || 'Failed to load quote details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteUpdate = () => {
    loadQuoteDetails();
    setShowEditModal(false);
  };

  const handleSendQuote = async () => {
    if (!quote) return;

    if (lineItems.length === 0) {
      toast.error('Cannot send quote without line items');
      return;
    }

    setActionLoading(true);
    try {
      await quoteService.update(quote.Id, { status_c: 'Sent' });
      toast.success('Quote sent to customer successfully');
      loadQuoteDetails();
    } catch (err) {
      console.error('Error sending quote:', err);
      toast.error(err.message || 'Failed to send quote');
    } finally {
      setActionLoading(false);
    }
  };

const handleConvertToInvoice = async () => {
    try {
      setLoading(true);
      const invoice = await quoteService.convertToInvoice(quote.Id);
      toast.success(`Quote converted to invoice successfully! Invoice ID: ${invoice.Id}`);
      
// Refresh quote data to show updated status
      try {
        const updatedQuote = await quoteService.getById(quote.Id);
        if (updatedQuote) {
          setQuote(updatedQuote);
        }
      } catch (refreshError) {
        console.error('Error refreshing quote data:', refreshError);
        // Continue with success message even if refresh fails
      }
      setQuote(updatedQuote);
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast.error(error.message || 'Failed to convert quote to invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      await quoteService.generateQuotePDF(quote, lineItems);
      toast.success('Quote PDF downloaded successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error(error.message || 'Failed to export quote as PDF');
    } finally {
      setLoading(false);
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

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.total_per_line_c) || 0), 0);
    const taxAmount = (subtotal * (parseFloat(quote?.tax_percent_c) || 0)) / 100;
    const discounts = parseFloat(quote?.discounts_c) || 0;
    const grandTotal = subtotal + taxAmount - discounts;

    return {
      subtotal,
      taxAmount,
      discounts,
      grandTotal
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Loading type="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/quotes" className="inline-flex items-center text-primary hover:text-primary/80">
              <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
              Back to Quotes
            </Link>
          </div>
          <ErrorView error={error} onRetry={loadQuoteDetails} />
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/quotes" className="inline-flex items-center text-primary hover:text-primary/80">
              <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
              Back to Quotes
            </Link>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <ApperIcon name="FileText" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Quote Not Found</h2>
            <p className="text-gray-600">The requested quote could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link to="/quotes" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Back to Quotes
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {quote.quote_number_c}
              </h1>
              <Badge variant={getStatusBadgeVariant(quote.status_c)}>
                {quote.status_c || 'Draft'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="text-sm"
              >
                <ApperIcon name="Edit2" className="w-4 h-4 mr-1" />
                Edit
              </Button>
              
              {quote.status_c !== 'Sent' && (
                <Button
                  variant="outline"
                  onClick={handleSendQuote}
                  disabled={actionLoading || lineItems.length === 0}
                  className="text-sm text-green-600 border-green-200 hover:bg-green-50"
                >
                  {actionLoading ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Send" className="w-4 h-4 mr-1" />
                      Send
                    </>
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleConvertToInvoice}
                className="text-sm"
              >
                <ApperIcon name="FileText" className="w-4 h-4 mr-1" />
                Convert to Invoice
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="text-sm"
              >
                <ApperIcon name="Download" className="w-4 h-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Customer Name</label>
                <p className="text-gray-900 mt-1">{quote.customer_name_c || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quote Date</label>
                <p className="text-gray-900 mt-1">{formatDate(quote.quote_date_c)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Expiration Date</label>
                <p className="text-gray-900 mt-1">{formatDate(quote.expiration_date_c)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Amount</label>
                <p className="text-gray-900 mt-1 font-semibold">{formatCurrency(totals.grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
            
            {lineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product/Service
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lineItems.map((item, index) => (
                      <tr key={item.Id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.product_service_c}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.description_c || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {item.quantity_c}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(item.unit_price_c)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.total_per_line_c)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="Package" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No line items found</p>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h2>
            <div className="flex justify-end">
              <div className="w-72 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({quote.tax_percent_c || 0}%):</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totals.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discounts:</span>
                  <span className="font-medium text-gray-900">-{formatCurrency(totals.discounts)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Grand Total:</span>
                    <span className="text-primary">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes/Terms */}
          {quote.notes_terms_c && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Terms</h2>
              <div className="text-gray-700 whitespace-pre-wrap">
                {quote.notes_terms_c}
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
<div>
                <label className="font-medium text-gray-600">Created:</label>
                <p className="text-gray-900 mt-1">{formatDate(quote.CreatedOn)}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Created By:</label>
                <p className="text-gray-900 mt-1">{quote.CreatedBy?.Name || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Last Modified:</label>
                <p className="text-gray-900 mt-1">{formatDate(quote.ModifiedOn)}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Modified By:</label>
                <p className="text-gray-900 mt-1">{quote.ModifiedBy?.Name || 'N/A'}</p>
              </div>
              {quote.Tags && (
                <div className="md:col-span-2">
                  <label className="font-medium text-gray-600">Tags:</label>
                  <p className="text-gray-900 mt-1">{quote.Tags}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <QuoteDetailModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          quote={quote}
          onQuoteUpdate={handleQuoteUpdate}
        />
      </div>
    </div>
  );
}