import React, { useState, useEffect } from "react";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { taskService } from "@/services/api/taskService";
import { activityService } from "@/services/api/activityService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const ContactDetailModal = ({ isOpen, onClose, contact, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [relatedData, setRelatedData] = useState({
    deals: [],
    tasks: [],
    activities: []
  });

  const tabs = [
    { id: "info", label: "Info", icon: "User" },
    { id: "deals", label: "Deals", icon: "DollarSign" },
    { id: "tasks", label: "Tasks", icon: "CheckSquare" },
    { id: "activities", label: "Activities", icon: "Activity" }
  ];

  useEffect(() => {
    if (contact && isOpen) {
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        position: contact.position || "",
        tags: contact.tags ? contact.tags.join(", ") : ""
      });
      loadRelatedData();
    }
  }, [contact, isOpen]);

  const loadRelatedData = async () => {
    if (!contact) return;
    
    try {
      setError("");
      setLoading(true);
      const [deals, tasks, activities] = await Promise.all([
        dealService.getByContactId(contact.Id.toString()),
        taskService.getByContactId(contact.Id.toString()),
        activityService.getByContactId(contact.Id.toString())
      ]);
      setRelatedData({ deals, tasks, activities });
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
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : []
      };
      await contactService.update(contact.Id, updateData);
      toast.success("Contact updated successfully!");
      setIsEditing(false);
      onUpdate();
      onClose();
    } catch (err) {
      toast.error("Failed to update contact");
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

  if (!contact) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${contact.firstName} ${contact.lastName}`}
      size="xl"
    >
      <div className="flex flex-col h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
<Avatar
                fallback={`${contact.firstName} ${contact.lastName}`}
                size="lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h3>
                <p className="text-gray-600">{contact.email}</p>
                {contact.company && (
                  <p className="text-sm text-gray-500">
                    {contact.position} at {contact.company}
                  </p>
                )}
              </div>
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
<div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <Input
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <Input
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone
                            </label>
                            <Input
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Company
                            </label>
                            <Input
                              value={formData.company}
                              onChange={(e) => handleInputChange("company", e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position
                          </label>
                          <Input
                            value={formData.position}
                            onChange={(e) => handleInputChange("position", e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (comma separated)
                          </label>
                          <Input
                            value={formData.tags}
                            onChange={(e) => handleInputChange("tags", e.target.value)}
                            placeholder="lead, enterprise, hot"
                            className="w-full"
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
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Email:</span>
                            <span className="text-sm font-medium">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Phone:</span>
                              <span className="text-sm font-medium">{contact.phone}</span>
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Company:</span>
                              <span className="text-sm font-medium">{contact.company}</span>
                            </div>
                          )}
                          {contact.position && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Position:</span>
                              <span className="text-sm font-medium">{contact.position}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {contact.tags && contact.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {contact.tags.map((tag, index) => (
                              <Badge key={index} variant="primary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Created:</span>
                            <span className="text-sm font-medium">
                              {format(new Date(contact.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Updated:</span>
                            <span className="text-sm font-medium">
                              {format(new Date(contact.updatedAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Deals Tab */}
              {activeTab === "deals" && (
                <div className="p-6">
                  {relatedData.deals.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <ApperIcon name="DollarSign" className="w-8 h-8 mx-auto mb-2" />
                      <p>No deals found for this contact</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {relatedData.deals.map((deal) => (
                        <div key={deal.Id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{deal.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatCurrency(deal.value)} • {deal.probability}% probability
                              </p>
                              {deal.expectedCloseDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Expected close: {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                                </p>
                              )}
                            </div>
                            <Badge variant={getStageColor(deal.stage)}>
                              {deal.stage.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>
                      ))}
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
                      <p>No tasks found for this contact</p>
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
                      <p>No activities found for this contact</p>
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

export default ContactDetailModal;