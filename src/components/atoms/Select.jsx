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
<select
      className={cn(
        "flex h-10 w-full rounded-lg border-2 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 relative z-50",
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      ) : (
        children
      )}
    </select>
  );
});

Select.displayName = "Select";

export default Select;