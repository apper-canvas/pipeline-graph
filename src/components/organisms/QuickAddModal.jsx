import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import { contactService } from '@/services/api/contactService';
import { dealService } from '@/services/api/dealService';
import { taskService } from '@/services/api/taskService';

const QuickAddModal = ({ isOpen, onClose, onSuccess, type = 'contact' }) => {
const [formData, setFormData] = useState({
    // Contact fields
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    tags: '',
    // Deal fields
    title: '',
    value: '',
    stage: 'prospect',
    contactId: '',
    // Task fields
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'not-started'
  });
const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [contacts, setContacts] = useState([]);

useEffect(() => {
    if ((type === 'deal' || type === 'task') && isOpen) {
      loadContacts();
    }
  }, [type, isOpen]);

const loadContacts = async () => {
  try {
    const contactsData = await contactService.getAll();
    // Ensure we always have an array, even if service returns null/undefined
    setContacts(Array.isArray(contactsData) ? contactsData : []);
  } catch (error) {
    console.error('Error loading contacts:', error);
    // Set empty array on error to prevent map errors
    setContacts([]);
  }
};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

const validateForm = () => {
    const newErrors = {};
    
    if (type === 'contact') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (type === 'deal') {
      if (!formData.title.trim()) {
        newErrors.title = 'Deal title is required';
      }
      
      if (!formData.value.trim()) {
        newErrors.value = 'Deal value is required';
      } else if (isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
        newErrors.value = 'Please enter a valid positive number';
      }
      
      if (!formData.contactId) {
newErrors.contactId = 'Please select a contact';
      }
    } else if (type === 'task') {
      if (!formData.title.trim()) {
        newErrors.title = 'Task title is required';
      }
      
      if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
if (type === 'contact') {
        const contactData = {
          firstName: formData.name.split(' ')[0] || formData.name,
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          address: formData.address,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactNumber: formData.emergencyContactNumber,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        };
        
        await contactService.create(contactData);
        toast.success('Contact added successfully!');
      } else if (type === 'deal') {
        const dealData = {
          title: formData.title,
          value: Number(formData.value),
          stage: formData.stage,
          contactId: parseInt(formData.contactId),
          probability: formData.stage === 'lead' ? 10 : 
                      formData.stage === 'qualified' ? 25 :
                      formData.stage === 'proposal' ? 50 :
                      formData.stage === 'negotiation' ? 75 : 90,
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        await dealService.create(dealData);
        toast.success('Deal added successfully!');
      } else if (type === 'task') {
        const taskData = {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          priority: formData.priority,
          contactId: formData.contactId ? parseInt(formData.contactId) : null
        };
        
        await taskService.create(taskData);
        toast.success('Task added successfully!');
      }
      
      // Reset form
setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        tags: '',
        title: '',
        value: '',
        stage: 'prospect',
        contactId: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'not-started'
      });
      setErrors({});
      
      // Call success callback and close modal
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      toast.error(`Failed to add ${type}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

const handleClose = () => {
    if (!isSubmitting) {
setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        tags: '',
        title: '',
        value: '',
        stage: 'prospect',
        contactId: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'not-started'
      });
      setErrors({});
      onClose();
    }
  };

const stageOptions = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed-won', label: 'Closed Won' }
  ];

const contactOptions = Array.isArray(contacts) ? contacts.map(contact => ({
  value: contact.Id?.toString() || '',
  label: `${(contact.first_name_c || contact.firstName || '')} ${(contact.last_name_c || contact.lastName || '')} - ${(contact.company_c || contact.company || 'No Company')}`.trim()
})) : [];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const statusOptions = [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
title={`Add New ${type === 'contact' ? 'Contact' : type === 'deal' ? 'Deal' : 'Task'}`}
    >
<form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
{type === 'contact' ? (
            <>
<div className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Enter contact name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-sm text-error font-medium">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-error font-medium">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>
<div>
                  <label htmlFor="contact-company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <Input
                    id="contact-company"
                    type="text"
                    placeholder="Enter company name"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    id="contact-address"
                    rows={3}
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-emergency-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <Input
                    id="contact-emergency-name"
                    type="text"
                    placeholder="Enter emergency contact name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-emergency-number" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Number
                  </label>
                  <Input
                    id="contact-emergency-number"
                    type="text"
                    placeholder="Enter emergency contact number"
                    value={formData.emergencyContactNumber}
                    onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <Input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple tags with commas
                  </p>
                </div>
              </div>
            </>
          ) : type === 'deal' ? (
            <>
              <div className="space-y-4">
                <div>
                  <label htmlFor="deal-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Title *
                  </label>
                  <Input
                    id="deal-title"
                    type="text"
                    placeholder="Enter deal title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-sm text-error font-medium">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="deal-value" className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Value *
                  </label>
                  <Input
                    id="deal-value"
                    type="number"
                    placeholder="Enter deal value"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    error={errors.value}
                    disabled={isSubmitting}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                  {errors.value && (
                    <p className="mt-1.5 text-sm text-error font-medium">{errors.value}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="deal-stage" className="block text-sm font-medium text-gray-700 mb-2">
                    Stage
                  </label>
                  <Select
                    id="deal-stage"
                    value={formData.stage}
                    onChange={(e) => handleInputChange('stage', e.target.value)}
                    options={stageOptions}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="deal-contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact *
                  </label>
                  <Select
                    id="deal-contact"
                    value={formData.contactId}
                    onChange={(e) => handleInputChange('contactId', e.target.value)}
                    options={contactOptions}
                    placeholder="Select a contact"
                    error={errors.contactId}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  {errors.contactId && (
                    <p className="mt-1.5 text-sm text-error font-medium">{errors.contactId}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <Input
                    id="task-title"
                    type="text"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-sm text-error font-medium">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Input
                    id="task-description"
                    type="text"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    error={errors.dueDate}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  {errors.dueDate && (
                    <p className="mt-1.5 text-sm text-error font-medium">{errors.dueDate}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <Select
                      id="task-priority"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      options={priorityOptions}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      id="task-status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      options={statusOptions}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="task-contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact
                  </label>
                  <Select
                    id="task-contact"
                    value={formData.contactId}
                    onChange={(e) => handleInputChange('contactId', e.target.value)}
                    options={contactOptions}
                    placeholder="Select a contact (optional)"
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}
        </div>
<div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 font-medium transition-all duration-200 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            icon={isSubmitting ? "Loader2" : "Plus"}
            className={`px-6 py-2.5 font-medium shadow-sm transition-all duration-200 rounded-lg ${isSubmitting ? "animate-spin" : ""}`}
          >
            {isSubmitting ? 'Adding...' : `Add ${type === 'contact' ? 'Contact' : type === 'deal' ? 'Deal' : 'Task'}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickAddModal;