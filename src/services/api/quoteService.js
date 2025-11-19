import { getApperClient } from '@/services/apperClient';

// Mock data for quotes since no database table is available
const mockQuotes = [
  {
    Id: 1,
    quoteNumber: "Q-2025-001",
    customerName: "Acme Corporation",
    customerEmail: "contact@acme.com",
    quoteDate: "2025-01-15",
    expirationDate: "2025-02-14",
    totalAmount: 15750.00,
    status: "sent",
    items: [
      { description: "Professional Services", quantity: 40, unitPrice: 150.00, total: 6000.00 },
      { description: "Software License", quantity: 5, unitPrice: 1950.00, total: 9750.00 }
    ],
    notes: "Initial quote for annual software licensing and professional services.",
    createdOn: "2025-01-15T08:30:00Z",
    modifiedOn: "2025-01-15T08:30:00Z"
  },
  {
    Id: 2,
    quoteNumber: "Q-2025-002",
    customerName: "TechStart Solutions",
    customerEmail: "info@techstart.com",
    quoteDate: "2025-01-14",
    expirationDate: "2025-02-13",
    totalAmount: 8500.00,
    status: "draft",
    items: [
      { description: "Consulting Package", quantity: 20, unitPrice: 175.00, total: 3500.00 },
      { description: "Implementation", quantity: 1, unitPrice: 5000.00, total: 5000.00 }
    ],
    notes: "Draft quote for consulting and implementation services.",
    createdOn: "2025-01-14T14:20:00Z",
    modifiedOn: "2025-01-14T16:45:00Z"
  },
  {
    Id: 3,
    quoteNumber: "Q-2025-003",
    customerName: "Global Enterprises Ltd",
    customerEmail: "procurement@global-ent.com",
    quoteDate: "2025-01-13",
    expirationDate: "2025-02-12",
    totalAmount: 25000.00,
    status: "accepted",
    items: [
      { description: "Enterprise Package", quantity: 1, unitPrice: 20000.00, total: 20000.00 },
      { description: "Training Session", quantity: 10, unitPrice: 500.00, total: 5000.00 }
    ],
    notes: "Enterprise package with comprehensive training program.",
    createdOn: "2025-01-13T10:15:00Z",
    modifiedOn: "2025-01-13T15:30:00Z"
  },
  {
    Id: 4,
    quoteNumber: "Q-2025-004",
    customerName: "Startup Innovations",
    customerEmail: "hello@startup-innovations.com",
    quoteDate: "2025-01-12",
    expirationDate: "2025-01-26",
    totalAmount: 3200.00,
    status: "expired",
    items: [
      { description: "Basic Package", quantity: 1, unitPrice: 2500.00, total: 2500.00 },
      { description: "Setup Fee", quantity: 1, unitPrice: 700.00, total: 700.00 }
    ],
    notes: "Basic package for startup company.",
    createdOn: "2025-01-12T09:00:00Z",
    modifiedOn: "2025-01-12T09:00:00Z"
  },
  {
    Id: 5,
    quoteNumber: "Q-2025-005",
    customerName: "Manufacturing Corp",
    customerEmail: "orders@manufacturing-corp.com",
    quoteDate: "2025-01-11",
    expirationDate: "2025-02-10",
    totalAmount: 12800.00,
    status: "rejected",
    items: [
      { description: "Industrial Solution", quantity: 2, unitPrice: 5000.00, total: 10000.00 },
      { description: "Maintenance Contract", quantity: 1, unitPrice: 2800.00, total: 2800.00 }
    ],
    notes: "Industrial solution with maintenance contract - rejected due to budget constraints.",
    createdOn: "2025-01-11T11:45:00Z",
    modifiedOn: "2025-01-11T11:45:00Z"
  },
  {
    Id: 6,
    quoteNumber: "Q-2025-006",
    customerName: "Retail Solutions Inc",
    customerEmail: "contact@retail-solutions.com",
    quoteDate: "2025-01-10",
    expirationDate: "2025-02-09",
    totalAmount: 7500.00,
    status: "sent",
    items: [
      { description: "Retail Package", quantity: 1, unitPrice: 6000.00, total: 6000.00 },
      { description: "Support Package", quantity: 1, unitPrice: 1500.00, total: 1500.00 }
    ],
    notes: "Comprehensive retail solution with 6-month support.",
    createdOn: "2025-01-10T13:20:00Z",
    modifiedOn: "2025-01-10T13:20:00Z"
  },
  {
    Id: 7,
    quoteNumber: "Q-2025-007",
    customerName: "Healthcare Systems",
    customerEmail: "admin@healthcare-sys.com",
    quoteDate: "2025-01-09",
    expirationDate: "2025-02-08",
    totalAmount: 18900.00,
    status: "draft",
    items: [
      { description: "Healthcare Module", quantity: 3, unitPrice: 4500.00, total: 13500.00 },
      { description: "Compliance Package", quantity: 1, unitPrice: 5400.00, total: 5400.00 }
    ],
    notes: "Healthcare-specific modules with compliance requirements.",
    createdOn: "2025-01-09T16:10:00Z",
    modifiedOn: "2025-01-09T17:25:00Z"
  },
  {
    Id: 8,
    quoteNumber: "Q-2025-008",
    customerName: "Education Partners",
    customerEmail: "procurement@education-partners.org",
    quoteDate: "2025-01-08",
    expirationDate: "2025-02-07",
    totalAmount: 9200.00,
    status: "accepted",
    items: [
      { description: "Educational License", quantity: 50, unitPrice: 120.00, total: 6000.00 },
      { description: "Training Workshop", quantity: 4, unitPrice: 800.00, total: 3200.00 }
    ],
    notes: "Educational institutions discount applied. Bulk licensing agreement.",
    createdOn: "2025-01-08T08:45:00Z",
    modifiedOn: "2025-01-08T14:15:00Z"
  }
];

// Utility function for realistic delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate next quote number
const generateQuoteNumber = () => {
  const year = new Date().getFullYear();
  const existingNumbers = mockQuotes.map(q => 
    parseInt(q.quoteNumber.split('-').pop())
  );
  const nextNumber = Math.max(...existingNumbers) + 1;
  return `Q-${year}-${nextNumber.toString().padStart(3, '0')}`;
};

// Quote Service Implementation
export const quoteService = {
  // Get all quotes
  async getAll() {
    await delay(300);
    return [...mockQuotes].sort((a, b) => new Date(b.quoteDate) - new Date(a.quoteDate));
  },

  // Get quote by ID
  async getById(id) {
    await delay(250);
    const quote = mockQuotes.find(q => q.Id === parseInt(id));
    if (!quote) {
      throw new Error('Quote not found');
    }
    return { ...quote };
  },

  // Create new quote
  async create(quoteData) {
    await delay(400);
    
    const newQuote = {
      Id: Date.now(),
      quoteNumber: generateQuoteNumber(),
      ...quoteData,
      quoteDate: quoteData.quoteDate || new Date().toISOString().split('T')[0],
      status: quoteData.status || 'draft',
      totalAmount: quoteData.totalAmount || 0,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString()
    };
    
    mockQuotes.push(newQuote);
    return { ...newQuote };
  },

  // Update existing quote
  async update(id, updateData) {
    await delay(350);
    
    const index = mockQuotes.findIndex(q => q.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Quote not found');
    }
    
    mockQuotes[index] = {
      ...mockQuotes[index],
      ...updateData,
      Id: parseInt(id), // Ensure ID doesn't change
      modifiedOn: new Date().toISOString()
    };
    
    return { ...mockQuotes[index] };
  },

  // Delete quote
  async delete(id) {
    await delay(300);
    
    const index = mockQuotes.findIndex(q => q.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Quote not found');
    }
    
    mockQuotes.splice(index, 1);
    return true;
  },

  // Update quote status
  async updateStatus(id, status) {
    await delay(300);
    
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    
    return this.update(id, { status });
  },

  // Search quotes
  async search(query, filters = {}) {
    await delay(250);
    
    let filtered = [...mockQuotes];
    
    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(quote =>
        quote.customerName.toLowerCase().includes(searchTerm) ||
        quote.quoteNumber.toLowerCase().includes(searchTerm) ||
        quote.customerEmail.toLowerCase().includes(searchTerm)
      );
    }
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(quote => filters.status.includes(quote.status));
    }
    
    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(quote => quote.quoteDate >= filters.startDate);
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(quote => quote.quoteDate <= filters.endDate);
    }
    
    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(quote => quote.totalAmount >= filters.minAmount);
    }
    
    if (filters.maxAmount) {
      filtered = filtered.filter(quote => quote.totalAmount <= filters.maxAmount);
    }
    
    return filtered.sort((a, b) => new Date(b.quoteDate) - new Date(a.quoteDate));
  }
};