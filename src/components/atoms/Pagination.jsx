import React from 'react';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';

const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const itemsPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' }
  ];

  if (totalPages <= 1) return null;

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalRecords);

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6",
      className
    )}>
      {/* Items per page and record count */}
      <div className="flex items-center space-x-4">
        <Select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          className="text-sm"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <span className="text-sm text-gray-700">
          Showing {startRecord} to {endRecord} of {totalRecords} results
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center space-x-1"
        >
          <ApperIcon name="ChevronLeft" className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((pageNumber, index) => (
            <React.Fragment key={index}>
              {pageNumber === '...' ? (
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              ) : (
                <Button
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="min-w-[40px]"
                >
                  {pageNumber}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center space-x-1"
        >
          <span>Next</span>
          <ApperIcon name="ChevronRight" className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;