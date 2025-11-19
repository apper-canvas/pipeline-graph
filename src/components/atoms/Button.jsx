import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  loading = false,
  icon,
  iconPosition = "left",
  ...props 
}, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-elevated transform hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-white border-2 border-secondary text-secondary hover:bg-secondary hover:text-white",
    outline: "bg-transparent border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-elevated transform hover:scale-[1.02]"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center space-x-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={loading}
      {...props}
    >
      {loading && <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === "left" && <ApperIcon name={icon} className="w-4 h-4" />}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && <ApperIcon name={icon} className="w-4 h-4" />}
    </button>
  );
});

Button.displayName = "Button";

export default Button;