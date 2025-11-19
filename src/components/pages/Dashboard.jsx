import React, { useEffect, useState } from "react";
import { dealService } from "@/services/api/dealService";
import { taskService } from "@/services/api/taskService";
import { activityService } from "@/services/api/activityService";
import { contactService } from "@/services/api/contactService";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import MetricCard from "@/components/molecules/MetricCard";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import Tasks from "@/components/pages/Tasks";
import Pipeline from "@/components/pages/Pipeline";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";

const Dashboard = () => {
  const [data, setData] = useState({
    pipelineStats: null,
    taskStats: null,
    recentActivities: [],
    dueTasks: [],
    contacts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setError("");
      setLoading(true);

      const [pipelineStats, taskStats, recentActivities, dueTasks, contacts] = await Promise.all([
        dealService.getPipelineStats(),
        taskService.getTaskStats(),
        activityService.getRecent(8),
        taskService.getDueTasks(),
        contactService.getAll()
      ]);

      setData({
        pipelineStats,
        taskStats,
        recentActivities,
        dueTasks: dueTasks.slice(0, 5),
        contacts
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

const handleCompleteTask = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId);
      toast.success("Task marked as complete!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed to update task");
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

const getContactName = (contactId) => {
    // Ensure contacts is always an array and contactId exists
    if (!contactId || !data.contacts || !Array.isArray(data.contacts)) {
      return "Unknown Contact";
    }
    
    const contact = data.contacts.find(c => c.Id && c.Id.toString() === contactId.toString());
    return contact ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || "Unknown Contact" : "Unknown Contact";
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

  const formatActivityColor = (type) => {
    const colors = {
      email: "text-blue-600 bg-blue-100",
      call: "text-green-600 bg-green-100", 
      meeting: "text-purple-600 bg-purple-100",
      note: "text-gray-600 bg-gray-100"
    };
    return colors[type] || "text-gray-600 bg-gray-100";
  };


  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadDashboardData} />;

  const totalPipelineValue = data.pipelineStats ? 
    Object.values(data.pipelineStats).reduce((sum, stage) => sum + stage.value, 0) : 0;

  const activeDeals = data.pipelineStats ? 
    Object.entries(data.pipelineStats)
      .filter(([stage]) => !stage.includes("closed"))
      .reduce((sum, [, stage]) => sum + stage.count, 0) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your sales pipeline.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Pipeline Value"
          value={`$${totalPipelineValue.toLocaleString()}`}
          change="+12.5%"
          changeType="positive"
          icon="DollarSign"
        />
        <MetricCard
          title="Active Deals"
          value={activeDeals.toString()}
          change="+3 this week"
          changeType="positive"
          icon="TrendingUp"
        />
        <MetricCard
          title="Tasks Due Today"
          value={data.taskStats?.dueToday?.toString() || "0"}
          subtitle={`${data.taskStats?.overdue || 0} overdue`}
          icon="Clock"
        />
        <MetricCard
          title="Completed Tasks"
          value={`${data.taskStats?.completed || 0}/${data.taskStats?.total || 0}`}
          change={`${Math.round((data.taskStats?.completed / data.taskStats?.total) * 100) || 0}%`}
          changeType="positive"
          icon="CheckCircle"
        />
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Pipeline Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.pipelineStats && Object.entries(data.pipelineStats).map(([stage, stats]) => (
            <div key={stage} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.count}</div>
              <div className="text-sm text-gray-600 mb-2 capitalize">
                {stage.replace("-", " ")}
              </div>
              <div className="text-sm font-medium text-primary">
                ${stats.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
            <ApperIcon name="Activity" className="w-5 h-5 text-gray-400" />
          </div>
          
          {data.recentActivities.length === 0 ? (
            <Empty 
              title="No activities yet"
              description="Start logging activities to track your sales progress."
              icon="Activity"
            />
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {data.recentActivities.map((activity) => (
                <div key={activity.Id} className="flex space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${formatActivityColor(activity.type)}`}>
                    <ApperIcon name={formatActivityIcon(activity.type)} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.subject}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getContactName(activity.contactId)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks Due */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Tasks Due</h2>
            <ApperIcon name="CheckSquare" className="w-5 h-5 text-gray-400" />
          </div>
          
          {data.dueTasks.length === 0 ? (
            <Empty 
              title="No due tasks"
              description="All caught up! Great work on staying on top of your tasks."
              icon="CheckCircle"
            />
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {data.dueTasks.map((task) => (
                <div key={task.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleCompleteTask(task.Id)}
                      className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded hover:border-primary transition-colors"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getContactName(task.contactId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(task.dueDate), "MMM d")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;