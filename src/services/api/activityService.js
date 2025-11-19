import { getApperClient } from "@/services/apperClient";

// Activity service for managing activities using ApperClient
export const activityService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('activities_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        subject: activity.subject_c || activity.Name,
        content: activity.content_c || '',
        timestamp: activity.timestamp_c || activity.CreatedOn,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('activities_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const activity = response.data;
      return {
        Id: activity.Id,
        type: activity.type_c,
        subject: activity.subject_c || activity.Name,
        content: activity.content_c || '',
        timestamp: activity.timestamp_c || activity.CreatedOn,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error);
      throw error;
    }
  },

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('activities_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "contact_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(contactId)]
        }],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        subject: activity.subject_c || activity.Name,
        content: activity.content_c || '',
        timestamp: activity.timestamp_c || activity.CreatedOn,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching activities by contact:", error);
      return [];
    }
  },

  async getByDealId(dealId) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('activities_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "deal_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(dealId)]
        }],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        subject: activity.subject_c || activity.Name,
        content: activity.content_c || '',
        timestamp: activity.timestamp_c || activity.CreatedOn,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching activities by deal:", error);
      return [];
    }
  },

  async getRecent(limit = 10) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('activities_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          "limit": limit,
          "offset": 0
        }
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        subject: activity.subject_c || activity.Name,
        content: activity.content_c || '',
        timestamp: activity.timestamp_c || activity.CreatedOn,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return [];
    }
  },

  async create(activityData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.createRecord('activities_c', {
        records: [{
          Name: activityData.subject,
          type_c: activityData.type,
          subject_c: activityData.subject,
          content_c: activityData.content,
          timestamp_c: activityData.timestamp || new Date().toISOString(),
          contact_id_c: activityData.contactId ? parseInt(activityData.contactId) : null,
          deal_id_c: activityData.dealId ? parseInt(activityData.dealId) : null
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const activity = result.data;
          return {
            Id: activity.Id,
            type: activity.type_c,
            subject: activity.subject_c || activity.Name,
            content: activity.content_c || '',
            timestamp: activity.timestamp_c || activity.CreatedOn,
            contactId: activity.contact_id_c?.Id || activity.contact_id_c,
            dealId: activity.deal_id_c?.Id || activity.deal_id_c,
            createdAt: activity.CreatedOn
          };
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  },

  async update(id, activityData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id)
      };

      // Only include fields that have values
      if (activityData.type) updateData.type_c = activityData.type;
      if (activityData.subject) {
        updateData.subject_c = activityData.subject;
        updateData.Name = activityData.subject;
      }
      if (activityData.content) updateData.content_c = activityData.content;
      if (activityData.timestamp) updateData.timestamp_c = activityData.timestamp;

      const response = await apperClient.updateRecord('activities_c', {
        records: [updateData]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const activity = result.data;
          return {
            Id: activity.Id,
            type: activity.type_c,
            subject: activity.subject_c || activity.Name,
            content: activity.content_c || '',
            timestamp: activity.timestamp_c || activity.CreatedOn,
            contactId: activity.contact_id_c?.Id || activity.contact_id_c,
            dealId: activity.deal_id_c?.Id || activity.deal_id_c,
            createdAt: activity.CreatedOn,
            updatedAt: activity.ModifiedOn
          };
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('activities_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  },

  async getActivityStats() {
    try {
      const activities = await this.getAll();
      
      const stats = {
        total: activities.length,
        byType: {
          email: activities.filter(a => a.type === "email").length,
          call: activities.filter(a => a.type === "call").length,
          meeting: activities.filter(a => a.type === "meeting").length,
          note: activities.filter(a => a.type === "note").length
        },
        thisWeek: 0,
        thisMonth: 0
      };
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      activities.forEach(activity => {
        const activityDate = new Date(activity.timestamp);
        if (activityDate >= weekAgo) {
          stats.thisWeek++;
        }
        if (activityDate >= monthAgo) {
          stats.thisMonth++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error("Error getting activity stats:", error);
      return {
        total: 0,
        byType: {
          email: 0,
          call: 0,
          meeting: 0,
          note: 0
        },
        thisWeek: 0,
        thisMonth: 0
      };
    }
  }
};