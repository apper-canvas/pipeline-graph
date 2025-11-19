import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found",
  description = "Get started by adding your first item.",
  actionLabel = "Add New",
  onAction,
  icon = "Plus"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={icon} className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg hover:shadow-elevated transform hover:scale-[1.02] transition-all duration-200"
        >
          <ApperIcon name="Plus" className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default Empty;