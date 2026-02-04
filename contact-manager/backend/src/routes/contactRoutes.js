const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateContact } = require('../middleware/validation');

// GET all contacts
router.get('/', contactController.getAllContacts);

// GET single contact
router.get('/:id', contactController.getContact);

// POST create new contact
router.post('/', validateContact, contactController.createContact);

// PUT update contact
router.put('/:id', validateContact, contactController.updateContact);

// DELETE contact
router.delete('/:id', contactController.deleteContact);

// PATCH toggle favorite
router.patch('/:id/favorite', contactController.toggleFavorite);

module.exports = router;