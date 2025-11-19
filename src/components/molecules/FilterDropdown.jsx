import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const FilterDropdown = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  multiple = false,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue) => {
    if (multiple) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

const getDisplayValue = () => {
    if (multiple) {
      return value.length > 0 ? `${value.length} selected` : label;
    }
    const selectedOption = options.find(opt => opt && opt.value === value);
    return selectedOption && selectedOption.label ? selectedOption.label : label;
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white hover:border-primary focus:border-primary focus:outline-none transition-colors duration-200"
      >
        <span className="truncate">{getDisplayValue()}</span>
        <ApperIcon 
          name="ChevronDown" 
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-elevated z-50 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-200",
                multiple && value.includes(option.value) && "bg-primary/10 text-primary",
                !multiple && value === option.value && "bg-primary/10 text-primary"
              )}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {multiple && value.includes(option.value) && (
                  <ApperIcon name="Check" className="w-4 h-4 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;