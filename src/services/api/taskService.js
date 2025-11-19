import { getApperClient } from "@/services/apperClient";

// Task service for managing tasks using ApperClient
export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
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

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name,
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn,
        updatedAt: task.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('tasks_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
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

      const task = response.data;
      return {
        Id: task.Id,
        title: task.title_c || task.Name,
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn,
        updatedAt: task.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
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

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name,
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn,
        updatedAt: task.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching tasks by contact:", error);
      return [];
    }
  },

  async getByDealId(dealId) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "deal_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(dealId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name,
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn,
        updatedAt: task.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching tasks by deal:", error);
      return [];
    }
  },

  async getDueTasks() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [
          {
            "FieldName": "completed_c",
            "Operator": "EqualTo",
            "Values": [false]
          },
          {
            "FieldName": "due_date_c",
            "Operator": "LessThanOrEqualTo",
            "Values": [today]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name,
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn,
        updatedAt: task.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching due tasks:", error);
      return [];
    }
  },

  async getOverdueTasks() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('tasks_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [
          {
            "FieldName": "completed_c",
            "Operator": "EqualTo",
            "Values": [false]
          },
          {
            "FieldName": "due_date_c",
            "Operator": "LessThan",
            "Values": [today]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name,
        description: task.description_c || '',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        priority: task.priority_c || 'medium',
        contactId: task.contact_id_c?.Id || task.contact_id_c,
        dealId: task.deal_id_c?.Id || task.deal_id_c,
        createdAt: task.CreatedOn,
        updatedAt: task.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching overdue tasks:", error);
      return [];
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.createRecord('tasks_c', {
        records: [{
          Name: taskData.title,
          title_c: taskData.title,
          description_c: taskData.description,
          due_date_c: taskData.dueDate,
          completed_c: false,
          priority_c: taskData.priority,
          contact_id_c: taskData.contactId ? parseInt(taskData.contactId) : null,
          deal_id_c: taskData.dealId ? parseInt(taskData.dealId) : null
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const task = result.data;
          return {
            Id: task.Id,
            title: task.title_c || task.Name,
            description: task.description_c || '',
            dueDate: task.due_date_c,
            completed: task.completed_c || false,
            priority: task.priority_c || 'medium',
            contactId: task.contact_id_c?.Id || task.contact_id_c,
            dealId: task.deal_id_c?.Id || task.deal_id_c,
            createdAt: task.CreatedOn
          };
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  async update(id, taskData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id)
      };

      // Only include fields that have values
      if (taskData.title) {
        updateData.title_c = taskData.title;
        updateData.Name = taskData.title;
      }
      if (taskData.description) updateData.description_c = taskData.description;
      if (taskData.dueDate) updateData.due_date_c = taskData.dueDate;
      if (taskData.completed !== undefined) updateData.completed_c = taskData.completed;
      if (taskData.priority) updateData.priority_c = taskData.priority;

      const response = await apperClient.updateRecord('tasks_c', {
        records: [updateData]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const task = result.data;
          return {
            Id: task.Id,
            title: task.title_c || task.Name,
            description: task.description_c || '',
            dueDate: task.due_date_c,
            completed: task.completed_c || false,
            priority: task.priority_c || 'medium',
            contactId: task.contact_id_c?.Id || task.contact_id_c,
            dealId: task.deal_id_c?.Id || task.deal_id_c,
            createdAt: task.CreatedOn,
            updatedAt: task.ModifiedOn
          };
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  async toggleComplete(id) {
    try {
      const task = await this.getById(id);
      return this.update(id, { completed: !task.completed });
    } catch (error) {
      console.error("Error toggling task completion:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('tasks_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  async getTaskStats() {
    try {
      const tasks = await this.getAll();
      
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const today = new Date().toISOString().split('T')[0];
      const overdue = tasks.filter(t => {
        return !t.completed && t.dueDate < today;
      }).length;
      const dueToday = tasks.filter(t => {
        return !t.completed && t.dueDate === today;
      }).length;
      
      return {
        total,
        completed,
        pending: total - completed,
        overdue,
        dueToday
      };
    } catch (error) {
      console.error("Error getting task stats:", error);
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        dueToday: 0
      };
    }
  }
};