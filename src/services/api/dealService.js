import deals from "@/services/mockData/deals.json";
import { csvExportService } from "@/services/csvExportService";

// Deal service for managing deals
// This would typically connect to your backend API
export const dealService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...deals];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const deal = deals.find(d => d.Id === parseInt(id));
    if (!deal) {
      throw new Error("Deal not found");
    }
    return { ...deal };
  },

  async getByContactId(contactId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return deals.filter(d => d.contactId === contactId.toString());
  },

  async getByStage(stage) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return deals.filter(d => d.stage === stage);
  },

  async create(dealData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newDeal = {
      Id: Math.max(...deals.map(d => d.Id), 0) + 1,
      ...dealData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, dealData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    deals[index] = {
      ...deals[index],
      ...dealData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    return { ...deals[index] };
  },

  async updateStage(id, newStage) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    deals[index] = {
      ...deals[index],
      stage: newStage,
      updatedAt: new Date().toISOString()
    };
    
    return { ...deals[index] };
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    deals.splice(index, 1);
    return { success: true };
  },

  async getPipelineStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
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
  },

  /**
   * Export deals to CSV format
   * @param {Array} dealsToExport - Deals to export (optional, defaults to all)
   * @param {Array} contacts - Contacts array for lookup (optional)
   * @returns {Promise<void>} Downloads CSV file
   */
  async exportToCSV(dealsToExport = null, contacts = []) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const dataToExport = dealsToExport || deals;
    
    // Helper function to get contact name
    const getContactName = (contactId) => {
      const contact = contacts.find(c => c.Id.toString() === contactId);
      return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
    };

    // Helper function to get contact company
    const getContactCompany = (contactId) => {
      const contact = contacts.find(c => c.Id.toString() === contactId);
      return contact?.company || '';
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
      { key: 'notes', label: 'Notes' },
      { key: 'createdAt', label: 'Created Date', formatter: csvExportService.formatDate },
      { key: 'updatedAt', label: 'Last Updated', formatter: csvExportService.formatDate }
    ];

    const csvContent = csvExportService.convertToCSV(dataToExport, headers);
    const filename = `deals_export_${csvExportService.getTimestamp()}.csv`;
    
    csvExportService.downloadCSV(csvContent, filename);
  }
};