import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  className,
  subtitle 
}) => {
  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-500"
  };

  const changeIcons = {
    positive: "TrendingUp",
    negative: "TrendingDown",
    neutral: "Minus"
  };

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-card p-6 hover:shadow-elevated transition-all duration-300 transform hover:scale-[1.02]",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center space-x-1 mt-2">
              <ApperIcon 
                name={changeIcons[changeType]} 
                className={cn("w-4 h-4", changeColors[changeType])} 
              />
              <span className={cn("text-sm font-medium", changeColors[changeType])}>
                {change}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
            <ApperIcon name={icon} className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;