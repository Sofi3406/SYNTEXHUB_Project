const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');

exports.getAllContacts = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, favorite } = req.query;
    const query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by favorite
    if (favorite !== undefined) {
      query.isFavorite = favorite === 'true';
    }
    
    const skip = (page - 1) * limit;
    
    const contacts = await Contact.find(query)
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Contact.countDocuments(query);
    
    res.json({
      success: true,
      count: contacts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};


exports.getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
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
  } catch (error) {
    next(error);
  }
};

exports.createContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const contact = await Contact.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: contact
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    next(error);
  }
};

exports.updateContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    let contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    // Check if email is being updated and if it already exists
    if (req.body.email && req.body.email !== contact.email) {
      const existingContact = await Contact.findOne({ email: req.body.email });
      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};


exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    await contact.deleteOne();
    
    res.json({
      success: true,
      message: 'Contact deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};


exports.toggleFavorite = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    contact.isFavorite = !contact.isFavorite;
    await contact.save();
    
    res.json({
      success: true,
      message: `Contact ${contact.isFavorite ? 'added to' : 'removed from'} favorites`,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};