import React from "react";

const Loading = ({ type = "skeleton" }) => {
  if (type === "spinner") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-card p-6">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;