import React, { useState, useEffect } from "react";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import DealDetailModal from "@/components/organisms/DealDetailModal";
import QuickAddModal from "@/components/organisms/QuickAddModal";
import ApperIcon from "@/components/ApperIcon";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [selectedDeal, setSelectedDeal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const stages = [
    { id: "lead", title: "Lead", color: "bg-gray-100" },
    { id: "qualified", title: "Qualified", color: "bg-blue-100" },
    { id: "proposal", title: "Proposal", color: "bg-yellow-100" },
    { id: "negotiation", title: "Negotiation", color: "bg-orange-100" },
    { id: "closed-won", title: "Closed Won", color: "bg-green-100" },
    { id: "closed-lost", title: "Closed Lost", color: "bg-red-100" }
  ];

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError(err.message || "Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id.toString() === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getContactCompany = (contactId) => {
    const contact = contacts.find(c => c.Id.toString() === contactId);
    return contact?.company || "";
  };

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getStageValue = (stage) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDeal(null);
      return;
    }

    try {
      await dealService.updateStage(draggedDeal.Id, targetStage);
      toast.success(`Deal moved to ${stages.find(s => s.id === targetStage)?.title}!`);
      loadData();
    } catch (err) {
      toast.error("Failed to update deal stage");
    } finally {
      setDraggedDeal(null);
    }
  };

  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    setIsDetailModalOpen(true);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;

  return (
<div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-2">
            Drag and drop deals between stages to update their status
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsQuickAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = getStageValue(stage.id);
            
            return (
              <div key={stage.id} className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stageDeals.length}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {stage.title}
                </div>
                <div className="text-sm font-medium text-primary">
                  {formatCurrency(stageValue)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div className={`${stage.color} rounded-lg p-4 mb-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{stage.title}</h3>
                  <Badge variant="default">
                    {stageDeals.length}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formatCurrency(getStageValue(stage.id))}
                </div>
              </div>

              {/* Deals */}
              <div className="space-y-3 min-h-[200px]">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ApperIcon name="Package" className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No deals in this stage</p>
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.Id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      onClick={() => handleDealClick(deal)}
                      className="bg-white rounded-lg shadow-card p-4 cursor-pointer hover:shadow-elevated transition-all duration-200 transform hover:scale-[1.02] border-l-4 border-primary"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {deal.title}
                        </h4>
                        <ApperIcon name="GripVertical" className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          {getContactName(deal.contactId)}
                        </p>
                        {getContactCompany(deal.contactId) && (
                          <p className="text-xs text-gray-500">
                            {getContactCompany(deal.contactId)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(deal.value)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {deal.probability}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

{/* Deal Detail Modal */}
      <DealDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        deal={selectedDeal}
        onUpdate={loadData}
      />

{/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onSuccess={loadData}
        type="deal"
      />
    </div>
  );
};

export default Pipeline;