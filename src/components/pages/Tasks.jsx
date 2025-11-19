import React, { useState, useEffect } from "react";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import QuickAddModal from "@/components/organisms/QuickAddModal";
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { format, isToday, isPast, isTomorrow } from "date-fns";
import { toast } from "react-toastify";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Overdue", value: "overdue" },
    { label: "Due Today", value: "today" }
  ];

  const priorityOptions = [
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" }
  ];

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      const [tasksData, contactsData, dealsData] = await Promise.all([
        taskService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setTasks(tasksData);
      setContacts(contactsData);
      setDeals(dealsData);
      setFilteredTasks(tasksData);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        getContactName(task.contactId).toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(task => {
        return statusFilter.some(status => {
          switch (status) {
            case "all":
              return true;
            case "completed":
              return task.completed;
            case "pending":
              return !task.completed && !isPast(new Date(task.dueDate));
            case "overdue":
              return !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
            case "today":
              return !task.completed && isToday(new Date(task.dueDate));
            default:
              return true;
          }
        });
      });
    }

    // Priority filter
    if (priorityFilter.length > 0) {
      filtered = filtered.filter(task => priorityFilter.includes(task.priority));
    }

    // Sort by due date and priority
    filtered.sort((a, b) => {
      // First sort by completed status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Then by due date
      const dateCompare = new Date(a.dueDate) - new Date(b.dueDate);
      if (dateCompare !== 0) return dateCompare;
      
      // Finally by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setFilteredTasks(filtered);
  }, [searchQuery, statusFilter, priorityFilter, tasks]);

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id.toString() === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "No Contact";
  };

  const getDealTitle = (dealId) => {
    const deal = deals.find(d => d.Id.toString() === dealId);
    return deal?.title || "";
  };

  const handleToggleComplete = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId);
      toast.success("Task status updated!");
      loadData();
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await taskService.delete(taskId);
      toast.success("Task deleted successfully!");
      loadData();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "error",
      medium: "warning",
      low: "success"
    };
    return colors[priority] || "default";
  };

  const getDateStatus = (dueDate, completed) => {
    if (completed) return { text: "Completed", color: "success" };
    
    const date = new Date(dueDate);
    if (isToday(date)) return { text: "Due Today", color: "warning" };
    if (isTomorrow(date)) return { text: "Due Tomorrow", color: "info" };
    if (isPast(date)) return { text: "Overdue", color: "error" };
    
    return { text: format(date, "MMM d"), color: "default" };
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).length,
    dueToday: tasks.filter(t => !t.completed && isToday(new Date(t.dueDate))).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {stats.pending} pending • {stats.overdue} overdue • {stats.dueToday} due today
          </p>
        </div>
        <div className="flex gap-2">
<Button
onClick={() => setIsQuickAddOpen(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            Add Task
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
          <div className="text-sm text-gray-600">Due Today</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tasks by title, description, or contact..."
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
            label="Priority"
            options={priorityOptions}
            value={priorityFilter}
            onChange={setPriorityFilter}
            multiple
            className="w-48"
          />
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty
          title="No tasks found"
          description="Try adjusting your search criteria or add new tasks."
          icon="CheckSquare"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => {
              const dateStatus = getDateStatus(task.dueDate, task.completed);
              
              return (
                <div
                  key={task.Id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    task.completed ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task.Id)}
                      className={`flex-shrink-0 mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      {task.completed && (
                        <ApperIcon name="Check" className="w-3 h-3" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-base font-medium ${
                            task.completed 
                              ? "text-gray-500 line-through" 
                              : "text-gray-900"
                          }`}>
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              {getContactName(task.contactId)}
                            </span>
                            
                            {getDealTitle(task.dealId) && (
                              <span className="text-sm text-gray-500">
                                • {getDealTitle(task.dealId)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 ml-4">
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          
                          <Badge variant={dateStatus.color}>
                            {dateStatus.text}
                          </Badge>
                          
                          <button
                            onClick={() => handleDeleteTask(task.Id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
)}
      
<QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          setIsQuickAddOpen(false);
          loadData();
        }}
        type="task"
      />
    </div>
  );
};

export default Tasks;