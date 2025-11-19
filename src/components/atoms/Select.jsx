import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({ 
  className, 
  children, 
  options, 
  placeholder,
  error,
  ...props 
}, ref) => {
  return (
<div className="relative">
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border-2 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 appearance-none cursor-pointer relative z-10",
          error ? "border-error" : "border-gray-300",
          className
        )}
        style={{
          position: 'relative',
          zIndex: 1000,
          backgroundColor: 'white'
        }}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options ? (
          options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-white text-gray-900 py-2 px-3 hover:bg-gray-50"
              style={{
                backgroundColor: 'white',
                color: '#111827'
              }}
            >
              {option.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

Select.displayName = "Select";

export default Select;