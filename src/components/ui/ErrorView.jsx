import React from "react";
import ApperIcon from "@/components/ApperIcon";

const ErrorView = ({ error = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name="AlertCircle" className="w-8 h-8 text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {error}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ApperIcon name="RefreshCw" className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorView;