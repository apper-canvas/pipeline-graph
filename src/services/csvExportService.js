// CSV Export Utility Service
export const csvExportService = {
  /**
   * Convert array of objects to CSV string
   * @param {Array} data - Array of objects to convert
   * @param {Array} headers - Array of header objects with key and label
   * @returns {string} CSV formatted string
   */
  convertToCSV(data, headers) {
    if (!data || data.length === 0) {
      return '';
    }

    // Create header row
    const headerRow = headers.map(header => `"${header.label}"`).join(',');
    
    // Create data rows
    const dataRows = data.map(item => {
      return headers.map(header => {
        let value = this.getNestedValue(item, header.key);
        
        // Format value based on type
        if (header.formatter) {
          value = header.formatter(value);
        }
        
        // Escape and quote the value
        return `"${this.escapeCSVValue(value)}"`;
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  },

  /**
   * Get nested object value by string path
   * @param {Object} obj - Object to get value from
   * @param {string} path - Dot notation path (e.g., 'user.name')
   * @returns {any} The value at the path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((value, key) => {
      return value && value[key] !== undefined ? value[key] : '';
    }, obj);
  },

  /**
   * Escape CSV value to handle quotes and commas
   * @param {any} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCSVValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    // Replace double quotes with double double quotes
    return stringValue.replace(/"/g, '""');
  },

  /**
   * Format date for CSV export
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
    } catch {
      return String(date);
    }
  },

  /**
   * Format currency for CSV export
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Format array as comma-separated string
   * @param {Array} array - Array to format
   * @returns {string} Comma-separated string
   */
  formatArray(array) {
    if (!Array.isArray(array)) return '';
    return array.join(', ');
  },

  /**
   * Download CSV file
   * @param {string} csvContent - CSV content
   * @param {string} filename - File name
   */
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      // Create download link
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL object
      URL.revokeObjectURL(url);
    }
  },

  /**
   * Generate timestamp for filename
   * @returns {string} Formatted timestamp
   */
  getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}`;
  }
};