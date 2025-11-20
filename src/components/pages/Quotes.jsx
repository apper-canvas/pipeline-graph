import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import SearchBar from '@/components/molecules/SearchBar';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import ErrorView from '@/components/ui/ErrorView';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Pagination from '@/components/atoms/Pagination';
import QuoteDetailModal from '@/components/organisms/QuoteDetailModal';
import ApperIcon from '@/components/ApperIcon';
import { quoteService } from '@/services/api/quoteService';

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [sortField, setSortField] = useState('quote_date_c');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Expired', label: 'Expired' }
  ];

  // Load quotes data
  useEffect(() => {
    loadQuotes();
  }, [refreshTrigger]);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quoteService.getAll();
      setQuotes(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load quotes');
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search and filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchQuery === '' || 
      quote.customer_name_c?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.quote_number_c?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || 
      statusFilter.includes(quote.status_c);
    
    return matchesSearch && matchesStatus;
  });

  // Sort quotes
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'total_amount_c') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    } else if (sortField === 'quote_date_c' || sortField === 'expiration_date_c') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination
  const totalRecords = sortedQuotes.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedQuotes = sortedQuotes.slice(startIndex, endIndex);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleRowClick = (quote) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
  };

  const handleQuoteUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowDetailModal(false);
    setSelectedQuote(null);
  };

  const handleCreateNew = () => {
    setSelectedQuote(null);
    setShowDetailModal(true);
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

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  if (loading) return <Loading type="page" />;
  
  if (error) return (
    <ErrorView 
      error={error} 
      onRetry={loadQuotes}
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600">Manage your sales quotes and proposals</p>
        </div>
        
        <Button onClick={handleCreateNew} className="w-full sm:w-auto">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New Quote
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search quotes by customer name or quote number..."
          />
        </div>
        
        <div className="flex gap-2">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            multiple
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {paginatedQuotes.length} of {totalRecords} quotes
        </span>
        {(searchQuery || statusFilter.length > 0) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter([]);
              setCurrentPage(1);
            }}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Quotes Table */}
      {paginatedQuotes.length === 0 ? (
        <Empty
          title="No quotes found"
          description={
            searchQuery || statusFilter.length > 0
              ? "No quotes match your current filters"
              : "Get started by creating your first quote"
          }
          actionLabel="New Quote"
          onAction={handleCreateNew}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('quote_number_c')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Quote Number</span>
                      <ApperIcon name={getSortIcon('quote_number_c')} className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('customer_name_c')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Customer Name</span>
                      <ApperIcon name={getSortIcon('customer_name_c')} className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('quote_date_c')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Quote Date</span>
                      <ApperIcon name={getSortIcon('quote_date_c')} className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('expiration_date_c')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Expiration Date</span>
                      <ApperIcon name={getSortIcon('expiration_date_c')} className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('total_amount_c')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Total Amount</span>
                      <ApperIcon name={getSortIcon('total_amount_c')} className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status_c')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ApperIcon name={getSortIcon('status_c')} className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedQuotes.map((quote) => (
                  <tr
                    key={quote.Id}
                    onClick={() => handleRowClick(quote)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary">
                        {quote.quote_number_c || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quote.customer_name_c || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(quote.quote_date_c)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(quote.expiration_date_c)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(quote.total_amount_c)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(quote.status_c)}>
                        {quote.status_c || 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(quote);
                          }}
                          className="text-primary hover:text-primary/80 p-1 rounded"
                          title="View Details"
                        >
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Quote Detail Modal */}
      <QuoteDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedQuote(null);
        }}
        quote={selectedQuote}
        onQuoteUpdate={handleQuoteUpdate}
      />
    </div>
  );
}