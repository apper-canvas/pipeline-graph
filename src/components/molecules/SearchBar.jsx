import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className,
  onClear 
}) => {
  return (
    <div className={cn("relative", className)}>
      <ApperIcon 
        name="Search" 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors duration-200"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ApperIcon name="X" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;