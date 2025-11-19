import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = () => {
  const location = useLocation();


  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pipeline Pro
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}

          {/* Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Mobile menu button */}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
    </header>
  );
};

export default Header;