const { body } = require('express-validator');

exports.validateContact = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  
  body('address.street')
    .optional()
    .trim(),
  
  body('address.city')
    .optional()
    .trim(),
  
  body('address.state')
    .optional()
    .trim(),
  
  body('address.zipCode')
    .optional()
    .trim(),
  
  body('address.country')
    .optional()
    .trim(),
  
  body('company')
    .optional()
    .trim(),
  
  body('jobTitle')
    .optional()
    .trim(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];