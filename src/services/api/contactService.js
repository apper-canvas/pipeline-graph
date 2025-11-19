import { getApperClient } from "@/services/apperClient";
import { csvExportService } from "@/services/csvExportService";

// Contact service for managing contacts using ApperClient
export const contactService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('contacts_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(contact => ({
        Id: contact.Id,
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        position: contact.position_c || '',
        tags: contact.Tags ? contact.Tags.split(',') : [],
        createdAt: contact.CreatedOn,
        updatedAt: contact.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('contacts_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const contact = response.data;
      return {
        Id: contact.Id,
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        position: contact.position_c || '',
        tags: contact.Tags ? contact.Tags.split(',') : [],
        createdAt: contact.CreatedOn,
        updatedAt: contact.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error);
      throw error;
    }
  },

  async create(contactData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.createRecord('contacts_c', {
        records: [{
          Name: `${contactData.name || contactData.firstName || ''} ${contactData.lastName || ''}`.trim() || contactData.email,
          first_name_c: contactData.firstName || contactData.name,
          last_name_c: contactData.lastName || '',
          email_c: contactData.email,
          phone_c: contactData.phone,
          company_c: contactData.company,
          position_c: contactData.position,
          Tags: Array.isArray(contactData.tags) ? contactData.tags.join(',') : contactData.tags
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const contact = result.data;
          return {
            Id: contact.Id,
            firstName: contact.first_name_c || '',
            lastName: contact.last_name_c || '',
            email: contact.email_c || '',
            phone: contact.phone_c || '',
            company: contact.company_c || '',
            position: contact.position_c || '',
            tags: contact.Tags ? contact.Tags.split(',') : [],
            createdAt: contact.CreatedOn,
            updatedAt: contact.ModifiedOn
          };
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  },

  async update(id, contactData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id)
      };

      // Only include fields that have values
      if (contactData.firstName) updateData.first_name_c = contactData.firstName;
      if (contactData.lastName) updateData.last_name_c = contactData.lastName;
      if (contactData.firstName || contactData.lastName) {
        updateData.Name = `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim();
      }
      if (contactData.email) updateData.email_c = contactData.email;
      if (contactData.phone) updateData.phone_c = contactData.phone;
      if (contactData.company) updateData.company_c = contactData.company;
      if (contactData.position) updateData.position_c = contactData.position;
      if (contactData.tags) {
        updateData.Tags = Array.isArray(contactData.tags) ? contactData.tags.join(',') : contactData.tags;
      }

      const response = await apperClient.updateRecord('contacts_c', {
        records: [updateData]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const contact = result.data;
          return {
            Id: contact.Id,
            firstName: contact.first_name_c || '',
            lastName: contact.last_name_c || '',
            email: contact.email_c || '',
            phone: contact.phone_c || '',
            company: contact.company_c || '',
            position: contact.position_c || '',
            tags: contact.Tags ? contact.Tags.split(',') : [],
            createdAt: contact.CreatedOn,
            updatedAt: contact.ModifiedOn
          };
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('contacts_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  },

  async search(query, filters = {}) {
    try {
      const apperClient = getApperClient();
      const whereConditions = [];

      // Text search across multiple fields
      if (query) {
        const searchFields = ['first_name_c', 'last_name_c', 'email_c', 'company_c', 'position_c'];
        const searchConditions = searchFields.map(field => ({
          fieldName: field,
          operator: "Contains",
          values: [query]
        }));

        if (searchConditions.length > 0) {
          whereConditions.push({
            operator: "OR",
            subGroups: [{
              conditions: searchConditions,
              operator: "OR"
            }]
          });
        }
      }

      let response;
      if (whereConditions.length > 0) {
        response = await apperClient.fetchRecords('contacts_c', {
          fields: [
            {"field": {"Name": "Id"}},
            {"field": {"Name": "Name"}},
            {"field": {"Name": "first_name_c"}},
            {"field": {"Name": "last_name_c"}},
            {"field": {"Name": "email_c"}},
            {"field": {"Name": "phone_c"}},
            {"field": {"Name": "company_c"}},
            {"field": {"Name": "position_c"}},
            {"field": {"Name": "Tags"}},
            {"field": {"Name": "CreatedOn"}},
            {"field": {"Name": "ModifiedOn"}}
          ],
          whereGroups: whereConditions
        });
      } else {
        // If no search query, get all contacts
        response = await this.getAll();
        return response;
      }

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      let results = response.data.map(contact => ({
        Id: contact.Id,
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        position: contact.position_c || '',
        tags: contact.Tags ? contact.Tags.split(',') : [],
        createdAt: contact.CreatedOn,
        updatedAt: contact.ModifiedOn
      }));

      // Apply client-side filters for company and tags
      if (filters.company && filters.company.length > 0) {
        results = results.filter(contact =>
          filters.company.includes(contact.company)
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(contact =>
          filters.tags.some(tag => contact.tags.includes(tag))
        );
      }

      return results;
    } catch (error) {
      console.error("Error searching contacts:", error);
      return [];
    }
  },

  async exportToCSV(contactsToExport = null) {
    const dataToExport = contactsToExport || await this.getAll();
    
    const headers = [
      { key: 'Id', label: 'Contact ID' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'company', label: 'Company' },
      { key: 'position', label: 'Position' },
      { key: 'tags', label: 'Tags', formatter: csvExportService.formatArray },
      { key: 'createdAt', label: 'Created Date', formatter: csvExportService.formatDate },
      { key: 'updatedAt', label: 'Last Updated', formatter: csvExportService.formatDate }
    ];

    const csvContent = csvExportService.convertToCSV(dataToExport, headers);
    const filename = `contacts_export_${csvExportService.getTimestamp()}.csv`;
    
    csvExportService.downloadCSV(csvContent, filename);
  }
};