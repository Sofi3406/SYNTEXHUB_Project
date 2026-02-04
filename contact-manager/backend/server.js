const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Contact Manager API',
    version: '1.0.0',
    endpoints: {
      contacts: '/api/contacts',
      test: '/api/test'
    }
  });
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working correctly!',
    timestamp: new Date().toISOString()
  });
});

// In-memory storage for contacts
let contacts = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    company: 'Tech Corp',
    jobTitle: 'Software Engineer',
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '098-765-4321',
    company: 'Business Inc',
    jobTitle: 'Product Manager',
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all contacts
app.get('/api/contacts', (req, res) => {
  const { search, favorite, page = 1, limit = 10 } = req.query;
  
  let filteredContacts = [...contacts];
  
  // Filter by search
  if (search) {
    filteredContacts = filteredContacts.filter(contact =>
      contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone.includes(search)
    );
  }
  
  // Filter by favorite
  if (favorite === 'true') {
    filteredContacts = filteredContacts.filter(contact => contact.isFavorite);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    count: paginatedContacts.length,
    total: filteredContacts.length,
    totalPages: Math.ceil(filteredContacts.length / limit),
    currentPage: parseInt(page),
    data: paginatedContacts
  });
});

// Get single contact
app.get('/api/contacts/:id', (req, res) => {
  const contact = contacts.find(c => c._id === req.params.id);
  
  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found'
    });
  }
  
  res.json({
    success: true,
    data: contact
  });
});

// Create contact
app.post('/api/contacts', (req, res) => {
  const contact = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  contacts.unshift(contact); 
  
  res.status(201).json({
    success: true,
    message: 'Contact created successfully',
    data: contact
  });
});

// Update contact
app.put('/api/contacts/:id', (req, res) => {
  const index = contacts.findIndex(c => c._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found'
    });
  }
  
  contacts[index] = {
    ...contacts[index],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json({
    success: true,
    message: 'Contact updated successfully',
    data: contacts[index]
  });
});

// Delete contact
app.delete('/api/contacts/:id', (req, res) => {
  const index = contacts.findIndex(c => c._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found'
    });
  }
  
  contacts.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Contact deleted successfully',
    data: {}
  });
});

// Toggle favorite
app.patch('/api/contacts/:id/favorite', (req, res) => {
  const index = contacts.findIndex(c => c._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found'
    });
  }
  
  contacts[index].isFavorite = !contacts[index].isFavorite;
  contacts[index].updatedAt = new Date();
  
  res.json({
    success: true,
    message: `Contact ${contacts[index].isFavorite ? 'added to' : 'removed from'} favorites`,
    data: contacts[index]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(20));
  console.log(`Server running on port ${PORT}`);
  console.log(`Mongo db is conected`);
  console.log('='.repeat(20));
});