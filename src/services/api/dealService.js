import { getApperClient } from "@/services/apperClient";
import { csvExportService } from "@/services/csvExportService";

// Deal service for managing deals using ApperClient
export const dealService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('deals_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(deal => ({
        Id: deal.Id,
        title: deal.title_c,
        value: deal.value_c || 0,
        stage: deal.stage_c,
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching deals:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('deals_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const deal = response.data;
      return {
        Id: deal.Id,
        title: deal.title_c,
        value: deal.value_c || 0,
        stage: deal.stage_c,
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error);
      throw error;
    }
  },

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('deals_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "contact_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(contactId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(deal => ({
        Id: deal.Id,
        title: deal.title_c,
        value: deal.value_c || 0,
        stage: deal.stage_c,
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching deals by contact:", error);
      return [];
    }
  },

  async getByStage(stage) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('deals_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "stage_c",
          "Operator": "EqualTo",
          "Values": [stage]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(deal => ({
        Id: deal.Id,
        title: deal.title_c,
        value: deal.value_c || 0,
        stage: deal.stage_c,
        probability: deal.probability_c || 0,
        expectedCloseDate: deal.expected_close_date_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching deals by stage:", error);
      return [];
    }
  },

  async create(dealData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.createRecord('deals_c', {
        records: [{
          Name: dealData.title,
          title_c: dealData.title,
          value_c: dealData.value,
          stage_c: dealData.stage,
          probability_c: dealData.probability,
          expected_close_date_c: dealData.expectedCloseDate,
          contact_id_c: parseInt(dealData.contactId)
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const deal = result.data;
          return {
            Id: deal.Id,
            title: deal.title_c,
            value: deal.value_c || 0,
            stage: deal.stage_c,
            probability: deal.probability_c || 0,
            expectedCloseDate: deal.expected_close_date_c,
            contactId: deal.contact_id_c?.Id || deal.contact_id_c,
            createdAt: deal.CreatedOn,
            updatedAt: deal.ModifiedOn
          };
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      throw error;
    }
  },

  async update(id, dealData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id)
      };

      // Only include fields that have values
      if (dealData.title) updateData.title_c = dealData.title;
      if (dealData.title) updateData.Name = dealData.title;
      if (dealData.value !== undefined) updateData.value_c = dealData.value;
      if (dealData.stage) updateData.stage_c = dealData.stage;
      if (dealData.probability !== undefined) updateData.probability_c = dealData.probability;
      if (dealData.expectedCloseDate) updateData.expected_close_date_c = dealData.expectedCloseDate;

      const response = await apperClient.updateRecord('deals_c', {
        records: [updateData]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const deal = result.data;
          return {
            Id: deal.Id,
            title: deal.title_c,
            value: deal.value_c || 0,
            stage: deal.stage_c,
            probability: deal.probability_c || 0,
            expectedCloseDate: deal.expected_close_date_c,
            contactId: deal.contact_id_c?.Id || deal.contact_id_c,
            createdAt: deal.CreatedOn,
            updatedAt: deal.ModifiedOn
          };
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error("Error updating deal:", error);
      throw error;
    }
  },

  async updateStage(id, newStage) {
    return this.update(id, { stage: newStage });
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('deals_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting deal:", error);
      throw error;
    }
  },

  async getPipelineStats() {
    try {
      const deals = await this.getAll();
      
      const stats = {
        lead: { count: 0, value: 0 },
        qualified: { count: 0, value: 0 },
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        "closed-won": { count: 0, value: 0 },
        "closed-lost": { count: 0, value: 0 }
      };
      
      deals.forEach(deal => {
        if (stats[deal.stage]) {
          stats[deal.stage].count++;
          stats[deal.stage].value += deal.value;
        }
      });
      
      return stats;
    } catch (error) {
      console.error("Error getting pipeline stats:", error);
      return {
        lead: { count: 0, value: 0 },
        qualified: { count: 0, value: 0 },
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        "closed-won": { count: 0, value: 0 },
        "closed-lost": { count: 0, value: 0 }
      };
    }
  },

  async exportToCSV(dealsToExport = null, contacts = []) {
    const dataToExport = dealsToExport || await this.getAll();
    
    // Helper function to get contact name
    const getContactName = (contactId) => {
      const contact = contacts.find(c => c.Id.toString() === contactId?.toString());
      return contact ? `${contact.first_name_c} ${contact.last_name_c}` : 'Unknown Contact';
    };

    // Helper function to get contact company
    const getContactCompany = (contactId) => {
      const contact = contacts.find(c => c.Id.toString() === contactId?.toString());
      return contact?.company_c || '';
    };

    const headers = [
      { key: 'Id', label: 'Deal ID' },
      { key: 'title', label: 'Deal Title' },
      { key: 'contactId', label: 'Contact Name', formatter: getContactName },
      { key: 'contactId', label: 'Contact Company', formatter: getContactCompany },
      { key: 'value', label: 'Deal Value', formatter: csvExportService.formatCurrency },
      { key: 'stage', label: 'Stage' },
      { key: 'probability', label: 'Probability (%)' },
      { key: 'expectedCloseDate', label: 'Expected Close Date', formatter: csvExportService.formatDate },
      { key: 'createdAt', label: 'Created Date', formatter: csvExportService.formatDate },
      { key: 'updatedAt', label: 'Last Updated', formatter: csvExportService.formatDate }
    ];

    const csvContent = csvExportService.convertToCSV(dataToExport, headers);
    const filename = `deals_export_${csvExportService.getTimestamp()}.csv`;
    
    csvExportService.downloadCSV(csvContent, filename);
  }
};