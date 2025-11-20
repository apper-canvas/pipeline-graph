import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { lineItemService } from '@/services/api/lineItemService';

const LineItemsManager = ({ quoteId, onTotalChange, initialLineItems = [] }) => {
  const [lineItems, setLineItems] = useState(initialLineItems);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    product_service_c: '',
    description_c: '',
    quantity_c: 1,
    unit_price_c: 0,
    total_per_line_c: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Calculate totals whenever line items change
  useEffect(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.total_per_line_c) || 0), 0);
    onTotalChange && onTotalChange(subtotal, lineItems);
  }, [lineItems, onTotalChange]);

  const handleAddItem = async () => {
    if (!newItem.product_service_c.trim()) {
      toast.error('Product/Service name is required');
      return;
    }

    if (newItem.quantity_c <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (newItem.unit_price_c < 0) {
      toast.error('Unit price cannot be negative');
      return;
    }

    setLoading(true);
    try {
      const result = await lineItemService.create({
        ...newItem,
        total_per_line_c: newItem.quantity_c * newItem.unit_price_c
      });

      if (result) {
        setLineItems(prev => [...prev, result]);
        setNewItem({
          product_service_c: '',
          description_c: '',
          quantity_c: 1,
          unit_price_c: 0,
          total_per_line_c: 0
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding line item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (id, field, value) => {
    const numericFields = ['quantity_c', 'unit_price_c'];
    const processedValue = numericFields.includes(field) ? parseFloat(value) || 0 : value;

    try {
      const result = await lineItemService.update(id, { [field]: processedValue });
      if (result) {
        setLineItems(prev => prev.map(item => 
          item.Id === id ? { ...item, ...result } : item
        ));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating line item:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this line item?')) {
      return;
    }

    try {
      const success = await lineItemService.delete(id);
      if (success) {
        setLineItems(prev => prev.filter(item => item.Id !== id));
      }
    } catch (error) {
      console.error('Error deleting line item:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleNewItemChange = (field, value) => {
    const numericFields = ['quantity_c', 'unit_price_c'];
    const processedValue = numericFields.includes(field) ? parseFloat(value) || 0 : value;
    
    setNewItem(prev => {
      const updated = { ...prev, [field]: processedValue };
      if (field === 'quantity_c' || field === 'unit_price_c') {
        updated.total_per_line_c = updated.quantity_c * updated.unit_price_c;
      }
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
        <Button
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </div>

      {/* Add new item form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-900">Add New Line Item</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Product/Service *
              </label>
              <Input
                value={newItem.product_service_c}
                onChange={(e) => handleNewItemChange('product_service_c', e.target.value)}
                placeholder="Enter product/service"
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                value={newItem.description_c}
                onChange={(e) => handleNewItemChange('description_c', e.target.value)}
                placeholder="Enter description"
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={newItem.quantity_c}
                onChange={(e) => handleNewItemChange('quantity_c', e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Unit Price *
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newItem.unit_price_c}
                onChange={(e) => handleNewItemChange('unit_price_c', e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Total
              </label>
              <div className="text-sm font-medium text-gray-900 py-2 px-3 bg-gray-100 rounded border">
                {formatCurrency(newItem.total_per_line_c)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddItem}
              disabled={loading}
              className="text-sm"
            >
              {loading ? (
                <>
                  <ApperIcon name="Loader2" className="w-3 h-3 mr-1 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Item'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewItem({
                  product_service_c: '',
                  description_c: '',
                  quantity_c: 1,
                  unit_price_c: 0,
                  total_per_line_c: 0
                });
              }}
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Line items table */}
      {lineItems.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product/Service
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lineItems.map((item, index) => (
                  <tr key={item.Id || index} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      {editingId === item.Id ? (
                        <Input
                          value={item.product_service_c || ''}
                          onChange={(e) => handleUpdateItem(item.Id, 'product_service_c', e.target.value)}
                          onBlur={() => setEditingId(null)}
                          autoFocus
                          className="text-sm"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:text-primary"
                          onClick={() => setEditingId(item.Id)}
                        >
                          {item.product_service_c || 'N/A'}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600">
                      {editingId === item.Id ? (
                        <Input
                          value={item.description_c || ''}
                          onChange={(e) => handleUpdateItem(item.Id, 'description_c', e.target.value)}
                          onBlur={() => setEditingId(null)}
                          className="text-sm"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:text-primary max-w-xs truncate"
                          onClick={() => setEditingId(item.Id)}
                          title={item.description_c}
                        >
                          {item.description_c || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      {editingId === item.Id ? (
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={item.quantity_c || 0}
                          onChange={(e) => handleUpdateItem(item.Id, 'quantity_c', e.target.value)}
                          onBlur={() => setEditingId(null)}
                          className="text-sm w-20"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:text-primary"
                          onClick={() => setEditingId(item.Id)}
                        >
                          {item.quantity_c || 0}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      {editingId === item.Id ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price_c || 0}
                          onChange={(e) => handleUpdateItem(item.Id, 'unit_price_c', e.target.value)}
                          onBlur={() => setEditingId(null)}
                          className="text-sm w-24"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:text-primary"
                          onClick={() => setEditingId(item.Id)}
                        >
                          {formatCurrency(item.unit_price_c)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(item.total_per_line_c)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingId(item.Id)}
                          className="text-gray-400 hover:text-primary p-1"
                          title="Edit item"
                        >
                          <ApperIcon name="Edit2" className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.Id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete item"
                        >
                          <ApperIcon name="Trash2" className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <ApperIcon name="Package" className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No line items added yet</p>
          <p className="text-sm">Click "Add Item" to get started</p>
        </div>
      )}
    </div>
  );
};

export default LineItemsManager;