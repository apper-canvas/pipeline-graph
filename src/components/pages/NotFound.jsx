import React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-blue-50">
      <div className="text-center space-y-6 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name="Search" className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            404 - Page Not Found
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button icon="Home">
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contacts">
              <Button variant="outline" icon="Users">
                View Contacts
              </Button>
            </Link>
            <Link to="/pipeline">
              <Button variant="outline" icon="GitBranch">
                View Pipeline
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>If you think this is a mistake, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;