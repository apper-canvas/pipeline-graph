import tasksData from "@/services/mockData/tasks.json";

let tasks = [...tasksData];

export const taskService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...tasks];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const task = tasks.find(t => t.Id === parseInt(id));
    if (!task) {
      throw new Error("Task not found");
    }
    return { ...task };
  },

  async getByContactId(contactId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return tasks.filter(t => t.contactId === contactId.toString());
  },

  async getByDealId(dealId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return tasks.filter(t => t.dealId === dealId.toString());
  },

  async getDueTasks() {
    await new Promise(resolve => setTimeout(resolve, 200));
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => 
      !t.completed && 
      t.dueDate <= today
    );
  },

  async getOverdueTasks() {
    await new Promise(resolve => setTimeout(resolve, 200));
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => 
      !t.completed && 
      t.dueDate < today
    );
  },

  async create(taskData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newTask = {
      Id: Math.max(...tasks.map(t => t.Id), 0) + 1,
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, taskData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    tasks[index] = {
      ...tasks[index],
      ...taskData,
      Id: parseInt(id)
    };
    
    return { ...tasks[index] };
  },

  async toggleComplete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    tasks[index] = {
      ...tasks[index],
      completed: !tasks[index].completed
    };
    
    return { ...tasks[index] };
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    tasks.splice(index, 1);
    return { success: true };
  },

  async getTaskStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return !t.completed && t.dueDate < today;
    }).length;
    const dueToday = tasks.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return !t.completed && t.dueDate === today;
    }).length;
    
    return {
      total,
      completed,
      pending: total - completed,
      overdue,
      dueToday
    };
  }
};