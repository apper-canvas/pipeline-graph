import activitiesData from "@/services/mockData/activities.json";

let activities = [...activitiesData];

export const activityService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const activity = activities.find(a => a.Id === parseInt(id));
    if (!activity) {
      throw new Error("Activity not found");
    }
    return { ...activity };
  },

  async getByContactId(contactId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return activities
      .filter(a => a.contactId === contactId.toString())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getByDealId(dealId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return activities
      .filter(a => a.dealId === dealId.toString())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getRecent(limit = 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  async create(activityData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newActivity = {
      Id: Math.max(...activities.map(a => a.Id), 0) + 1,
      ...activityData,
      timestamp: new Date().toISOString()
    };
    
    activities.unshift(newActivity);
    return { ...newActivity };
  },

  async update(id, activityData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Activity not found");
    }
    
    activities[index] = {
      ...activities[index],
      ...activityData,
      Id: parseInt(id)
    };
    
    return { ...activities[index] };
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Activity not found");
    }
    
    activities.splice(index, 1);
    return { success: true };
  },

  async getActivityStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
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
  }
};