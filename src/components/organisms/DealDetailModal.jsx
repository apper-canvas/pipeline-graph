import React, { useState, useEffect } from "react";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ApperIcon from "@/components/ApperIcon";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { taskService } from "@/services/api/taskService";
import { activityService } from "@/services/api/activityService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const DealDetailModal = ({ isOpen, onClose, deal, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [contact, setContact] = useState(null);
  const [relatedData, setRelatedData] = useState({
    tasks: [],
    activities: []
  });

  const tabs = [
    { id: "info", label: "Info", icon: "DollarSign" },
    { id: "tasks", label: "Tasks", icon: "CheckSquare" },
    { id: "activities", label: "Activities", icon: "Activity" }
  ];

  const stageOptions = [
    { label: "Lead", value: "lead" },
    { label: "Qualified", value: "qualified" },
    { label: "Proposal", value: "proposal" },
    { label: "Negotiation", value: "negotiation" },
    { label: "Closed Won", value: "closed-won" },
    { label: "Closed Lost", value: "closed-lost" }
  ];

  useEffect(() => {
    if (deal && isOpen) {
      setFormData({
        title: deal.title || "",
        value: deal.value || "",
        stage: deal.stage || "lead",
        probability: deal.probability || "",
        expectedCloseDate: deal.expectedCloseDate || ""
      });
      loadRelatedData();
    }
  }, [deal, isOpen]);

  const loadRelatedData = async () => {
    if (!deal) return;
    
    try {
      setError("");
      setLoading(true);
      const [contactData, tasks, activities] = await Promise.all([
        contactService.getById(deal.contactId),
        taskService.getByDealId(deal.Id.toString()),
        activityService.getByDealId(deal.Id.toString())
      ]);
      setContact(contactData);
      setRelatedData({ tasks, activities });
    } catch (err) {
      setError(err.message || "Failed to load related data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updateData = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        probability: parseFloat(formData.probability) || 0
      };
      await dealService.update(deal.Id, updateData);
      toast.success("Deal updated successfully!");
      setIsEditing(false);
      onUpdate();
      onClose();
    } catch (err) {
      toast.error("Failed to update deal");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
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

  const getPriorityColor = (priority) => {
    const colors = {
      high: "error",
      medium: "warning",
      low: "success"
    };
    return colors[priority] || "default";
  };

  const formatActivityIcon = (type) => {
    const icons = {
      email: "Mail",
      call: "Phone",
      meeting: "Calendar",
      note: "FileText"
    };
    return icons[type] || "MessageCircle";
  };

  if (!deal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deal.title}
      size="xl"
    >
      <div className="flex flex-col h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {deal.title}
              </h3>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(deal.value)}
                </span>
                <Badge variant={getStageColor(deal.stage)}>
                  {stageOptions.find(s => s.value === deal.stage)?.label || deal.stage}
                </Badge>
                <span className="text-sm text-gray-500">
                  {deal.probability}% probability
                </span>
              </div>
              {contact && (
                <p className="text-sm text-gray-600 mt-1">
                  Contact: {contact.firstName} {contact.lastName}
                  {contact.company && ` at ${contact.company}`}
                </p>
              )}
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              icon={isEditing ? "X" : "Edit"}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <ApperIcon name={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && activeTab !== "info" ? (
            <div className="p-6">
              <Loading type="spinner" />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorView error={error} onRetry={loadRelatedData} />
            </div>
          ) : (
            <>
              {/* Info Tab */}
              {activeTab === "info" && (
                <div className="p-6 space-y-6">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deal Title
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Value ($)
                          </label>
                          <Input
                            type="number"
                            value={formData.value}
                            onChange={(e) => handleInputChange("value", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Probability (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.probability}
                            onChange={(e) => handleInputChange("probability", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stage
                          </label>
<Select
                            value={formData.stage}
                            onChange={(e) => handleInputChange("stage", e.target.value)}
                            options={stageOptions}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Close Date
                          </label>
                          <Input
                            type="date"
                            value={formData.expectedCloseDate}
                            onChange={(e) => handleInputChange("expectedCloseDate", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSave} loading={loading}>
                          Save Changes
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Deal Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Value:</span>
                            <span className="text-sm font-medium">{formatCurrency(deal.value)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Stage:</span>
                            <Badge variant={getStageColor(deal.stage)}>
                              {stageOptions.find(s => s.value === deal.stage)?.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Probability:</span>
                            <span className="text-sm font-medium">{deal.probability}%</span>
                          </div>
                          {deal.expectedCloseDate && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Expected Close:</span>
                              <span className="text-sm font-medium">
                                {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {contact && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Contact</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Name:</span>
                              <span className="text-sm font-medium">
                                {contact.firstName} {contact.lastName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Email:</span>
                              <span className="text-sm font-medium">{contact.email}</span>
                            </div>
                            {contact.company && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Company:</span>
                                <span className="text-sm font-medium">{contact.company}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Created:</span>
                            <span className="text-sm font-medium">
                              {format(new Date(deal.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Updated:</span>
                            <span className="text-sm font-medium">
                              {format(new Date(deal.updatedAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === "tasks" && (
                <div className="p-6">
                  {relatedData.tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <ApperIcon name="CheckSquare" className="w-8 h-8 mx-auto mb-2" />
                      <p>No tasks found for this deal</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {relatedData.tasks.map((task) => (
                        <div key={task.Id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`w-5 h-5 rounded border-2 mt-0.5 ${
                                task.completed 
                                  ? "bg-green-500 border-green-500" 
                                  : "border-gray-300"
                              }`}>
                                {task.completed && (
                                  <ApperIcon name="Check" className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div>
                                <h4 className={`font-medium ${
                                  task.completed ? "text-gray-500 line-through" : "text-gray-900"
                                }`}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {task.description}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <Badge variant={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activities Tab */}
              {activeTab === "activities" && (
                <div className="p-6">
                  {relatedData.activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <ApperIcon name="Activity" className="w-8 h-8 mx-auto mb-2" />
                      <p>No activities found for this deal</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {relatedData.activities.map((activity, index) => (
                        <div key={activity.Id} className="relative">
                          {index < relatedData.activities.length - 1 && (
                            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                          )}
                          <div className="flex space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <ApperIcon 
                                name={formatActivityIcon(activity.type)} 
                                className="w-5 h-5 text-primary" 
                              />
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {activity.subject}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {activity.content}
                                    </p>
                                  </div>
                                  <Badge variant="default" className="capitalize">
                                    {activity.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                  {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DealDetailModal;