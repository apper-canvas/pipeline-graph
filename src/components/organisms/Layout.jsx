import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/layouts/Root";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

export default function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();

const navigation = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Contacts", href: "/contacts", icon: "Users" },
    { name: "Deals", href: "/deals", icon: "DollarSign" },
    { name: "Pipeline", href: "/pipeline", icon: "GitBranch" },
    { name: "Quotes", href: "/quotes", icon: "FileText" },
    { name: "Tasks", href: "/tasks", icon: "CheckSquare" }
  ];
  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Zap" className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">Pipeline Pro</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                )}
              >
                <ApperIcon name={item.icon} className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with mobile menu button */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </button>
          
<div className="flex items-center space-x-4 ml-auto">
            <button className="p-2 rounded-lg text-gray-700 hover:bg-gray-100">
              <ApperIcon name="Bell" className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-gray-700 hover:bg-gray-100">
              <ApperIcon name="Settings" className="w-5 h-5" />
            </button>
            <button 
              onClick={logout}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              title="Logout"
            >
              <ApperIcon name="LogOut" className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}