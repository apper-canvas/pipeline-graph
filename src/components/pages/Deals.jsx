import React, { useEffect, useState } from "react";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { csvExportService } from "@/services/csvExportService";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import DealDetailModal from "@/components/organisms/DealDetailModal";
import QuickAddModal from "@/components/organisms/QuickAddModal";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStages, setSelectedStages] = useState([]);
const [selectedDeal, setSelectedDeal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const stageOptions = [
    { label: "Lead", value: "lead" },
    { label: "Qualified", value: "qualified" },
    { label: "Proposal", value: "proposal" },
    { label: "Negotiation", value: "negotiation" },
    { label: "Closed Won", value: "closed-won" },
    { label: "Closed Lost", value: "closed-lost" }
  ];

const [isExporting, setIsExporting] = useState(false);

  const loadDeals = async () => {
    try {
      setError("");
      setLoading(true);
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
      setFilteredDeals(dealsData);
    } catch (err) {
      setError(err.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const handleExportDeals = async () => {
    try {
      setIsExporting(true);
      await dealService.exportToCSV(filteredDeals, contacts);
      toast.success(`Successfully exported ${filteredDeals.length} deals to CSV`);
    } catch (err) {
      toast.error("Failed to export deals");
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    let filtered = [...deals];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(query) ||
        getContactName(deal.contactId).toLowerCase().includes(query)
      );
    }

    // Stage filter
    if (selectedStages.length > 0) {
      filtered = filtered.filter(deal => selectedStages.includes(deal.stage));
    }

    setFilteredDeals(filtered);
  }, [searchQuery, selectedStages, deals]);

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id.toString() === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getContactCompany = (contactId) => {
    const contact = contacts.find(c => c.Id.toString() === contactId);
    return contact?.company || "";
  };

  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    setIsDetailModalOpen(true);
  };

  const handleDeleteDeal = async (dealId) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      await dealService.delete(dealId);
      toast.success("Deal deleted successfully!");
      loadDeals();
    } catch (err) {
      toast.error("Failed to delete deal");
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      "lead": "default",
      "qualified": "info",
      "proposal": "warning",
      "negotiation": "primary",
      "closed-won": "success",
      "closed-lost": "error"
    };
    return colors[stage] || "default";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadDeals} />;

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const averageValue = filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-1">
            {filteredDeals.length} deals • {formatCurrency(totalValue)} total value
          </p>
        </div>
        
        {/* Export Button */}
<div className="flex items-center gap-3">
          <Button
            onClick={() => setIsQuickAddOpen(true)}
            variant="solid"
            size="sm"
            icon="Plus"
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Add Deal
          </Button>
          <Button
            onClick={handleExportDeals}
            disabled={isExporting || filteredDeals.length === 0}
            variant="outline"
            size="sm"
            icon={isExporting ? "Loader2" : "Download"}
            className={isExporting ? "animate-spin" : ""}
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-gray-900">{filteredDeals.length}</div>
          <div className="text-sm text-gray-600">Total Deals</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(averageValue)}</div>
          <div className="text-sm text-gray-600">Average Value</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search deals by title, contact name..."
            onClear={() => setSearchQuery("")}
          />
        </div>
        <div className="flex gap-3">
          <FilterDropdown
            label="Stage"
            options={stageOptions}
            value={selectedStages}
            onChange={setSelectedStages}
            multiple
            className="w-48"
          />
        </div>
      </div>

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <Empty
          title="No deals found"
          description="Try adjusting your search criteria or add new deals."
          icon="DollarSign"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Close
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeals.map((deal) => (
                  <tr key={deal.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDealClick(deal)}
                        className="text-sm font-medium text-gray-900 hover:text-primary transition-colors text-left"
                      >
                        {deal.title}
                      </button>
                      <div className="text-sm text-gray-500">
                        {deal.probability}% probability
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getContactName(deal.contactId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getContactCompany(deal.contactId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(deal.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStageColor(deal.stage)}>
                        {stageOptions.find(s => s.value === deal.stage)?.label || deal.stage}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deal.expectedCloseDate ? 
                        format(new Date(deal.expectedCloseDate), "MMM d, yyyy") : 
                        "—"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDealClick(deal)}
                          className="text-primary hover:text-primary/80 p-1 rounded transition-colors"
                        >
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.Id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
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

      {/* Deal Detail Modal */}
<DealDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        deal={selectedDeal}
        onUpdate={loadDeals}
      />
      
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={loadDeals}
        type="deal"
      />
    </div>
  );
};

export default Deals;