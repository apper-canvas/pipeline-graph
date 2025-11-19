import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { quoteService } from "@/services/api/quoteService";
import { format, isAfter, parseISO } from "date-fns";
import { toast } from "react-toastify";

const Quotes = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
    { label: "Expired", value: "expired" }
  ];

  const sortOptions = [
    { label: "Date (Newest)", value: "date-desc" },
    { label: "Date (Oldest)", value: "date-asc" },
    { label: "Amount (Highest)", value: "amount-desc" },
    { label: "Amount (Lowest)", value: "amount-asc" },
    { label: "Customer (A-Z)", value: "customer-asc" },
    { label: "Customer (Z-A)", value: "customer-desc" },
    { label: "Status", value: "status-asc" }
  ];

  const loadQuotes = async () => {
    try {
      setError("");
      setLoading(true);
      const quotesData = await quoteService.getAll();
      setQuotes(quotesData);
      setFilteredQuotes(quotesData);
    } catch (err) {
      setError(err.message || "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    let filtered = [...quotes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quote =>
        quote.customerName.toLowerCase().includes(query) ||
        quote.quoteNumber.toLowerCase().includes(query) ||
        quote.customerEmail.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes("all")) {
      filtered = filtered.filter(quote => statusFilter.includes(quote.status));
    }

    // Sort
    filtered.sort((a, b) => {
      const [field, order] = sortBy.split('-');
      let comparison = 0;

      switch (field) {
        case 'date':
          comparison = new Date(a.quoteDate) - new Date(b.quoteDate);
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'customer':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case 'status':
          const statusOrder = { draft: 1, sent: 2, accepted: 3, rejected: 4, expired: 5 };
          comparison = (statusOrder[a.status] || 6) - (statusOrder[b.status] || 6);
          break;
        default:
          comparison = new Date(b.quoteDate) - new Date(a.quoteDate);
      }

      return order === 'desc' ? -comparison : comparison;
    });

    setFilteredQuotes(filtered);
  }, [searchQuery, statusFilter, sortBy, quotes]);

  const handleDeleteQuote = async (quoteId) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;

    try {
      await quoteService.delete(quoteId);
      toast.success("Quote deleted successfully!");
      loadQuotes();
    } catch (err) {
      toast.error("Failed to delete quote");
    }
  };

  const handleStatusUpdate = async (quoteId, newStatus) => {
    try {
      await quoteService.updateStatus(quoteId, newStatus);
      toast.success("Quote status updated!");
      loadQuotes();
    } catch (err) {
      toast.error("Failed to update quote status");
    }
  };

  const handleQuoteClick = (quote) => {
    navigate(`/quotes/${quote.Id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      sent: "info",
      accepted: "success", 
      rejected: "error",
      expired: "warning"
    };
    return colors[status] || "default";
  };

  const isExpiringSoon = (expirationDate) => {
    const today = new Date();
    const expDate = parseISO(expirationDate);
    const daysDiff = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 3 && daysDiff >= 0;
  };

  const isExpired = (expirationDate) => {
    return isAfter(new Date(), parseISO(expirationDate));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadQuotes} />;

  const stats = {
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
    expired: quotes.filter(q => q.status === 'expired').length,
    totalValue: quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-1">
            {stats.sent} sent • {stats.accepted} accepted • {formatCurrency(stats.totalValue)} total value
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/quotes/new')}
            variant="primary"
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            New Quote
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          <div className="text-sm text-gray-600">Draft</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
          <div className="text-sm text-gray-600">Sent</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
          <div className="text-sm text-gray-600">Expired</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search quotes by customer, number, or email..."
            onClear={() => setSearchQuery("")}
          />
        </div>
        <div className="flex gap-3">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            multiple
            className="w-48"
          />
          <FilterDropdown
            label="Sort By"
            options={sortOptions}
            value={[sortBy]}
            onChange={(values) => handleSortChange(values[0] || "date-desc")}
            className="w-48"
          />
        </div>
      </div>

      {/* Quotes Table */}
      {filteredQuotes.length === 0 ? (
        <Empty
          title="No quotes found"
          description="Try adjusting your search criteria or create a new quote."
          icon="FileText"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr
                    key={quote.Id}
                    onClick={() => handleQuoteClick(quote)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quote.quoteNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quote.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quote.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(parseISO(quote.quoteDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(parseISO(quote.expirationDate), 'MMM d, yyyy')}
                      </div>
                      {isExpiringSoon(quote.expirationDate) && !isExpired(quote.expirationDate) && (
                        <div className="text-xs text-orange-600 font-medium">
                          Expires soon
                        </div>
                      )}
                      {isExpired(quote.expirationDate) && quote.status !== 'expired' && (
                        <div className="text-xs text-red-600 font-medium">
                          Expired
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(quote.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(quote.status)}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/quotes/${quote.Id}/edit`);
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                          title="Edit Quote"
                        >
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </button>
                        {quote.status === 'draft' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(quote.Id, 'sent');
                            }}
                            className="text-gray-400 hover:text-green-600 transition-colors p-1"
                            title="Send Quote"
                          >
                            <ApperIcon name="Send" className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuote(quote.Id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Delete Quote"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;