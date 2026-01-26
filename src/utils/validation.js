// Validation utilities for Secure Print Link

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePin = (pin) => {
  // 4 digits only
  const pinRegex = /^\d{4}$/;
  return pinRegex.test(pin);
};

export const validateJobSubmission = (jobData) => {
  const errors = {};
  
  if (!jobData.userId) {
    errors.userId = 'User ID is required';
  }
  
  if (!jobData.documentName || jobData.documentName.trim() === '') {
    errors.documentName = 'Document name is required';
  }
  
  if (jobData.documentName && jobData.documentName.length > 255) {
    errors.documentName = 'Document name must be less than 255 characters';
  }
  
  if (jobData.pages !== undefined && (jobData.pages < 1 || jobData.pages > 10000)) {
    errors.pages = 'Pages must be between 1 and 10,000';
  }
  
  if (jobData.copies !== undefined && (jobData.copies < 1 || jobData.copies > 999)) {
    errors.copies = 'Copies must be between 1 and 999';
  }
  
  if (jobData.priority && !['low', 'normal', 'high'].includes(jobData.priority)) {
    errors.priority = 'Priority must be low, normal, or high';
  }
  
  if (jobData.notes && jobData.notes.length > 1000) {
    errors.notes = 'Notes must be less than 1000 characters';
  }
  
  if (jobData.expirationDuration !== undefined && (jobData.expirationDuration < 1 || jobData.expirationDuration > 1440)) {
    errors.expirationDuration = 'Expiration must be between 1 and 1440 minutes (24 hours)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFileUpload = (file) => {
  const errors = [];
  const maxSize = 20 * 1024 * 1024; // 20MB
  const supportedTypes = [
    // PDF
    'application/pdf',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    // Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    // Presentations
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text
    'application/json',
    'text/html',
    'text/css',
    'application/javascript'
  ];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
  }
  
  if (!supportedTypes.includes(file.type)) {
    errors.push('File type not supported');
  }
  
  // Additional validation for specific file types
  const fileName = file.name.toLowerCase();
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  const supportedExtensions = [
    '.pdf', '.doc', '.docx', '.txt', '.rtf',
    '.xls', '.xlsx', '.csv',
    '.ppt', '.pptx',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    '.json', '.html', '.htm', '.css', '.js'
  ];
  
  if (!supportedExtensions.includes(extension)) {
    errors.push('File extension not supported');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateToken = (token) => {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Token is required' };
  }
  
  if (token.length < 16) {
    return { isValid: false, error: 'Token is too short' };
  }
  
  return { isValid: true };
};

export const validateJobId = (jobId) => {
  if (!jobId || typeof jobId !== 'string') {
    return { isValid: false, error: 'Job ID is required' };
  }
  
  if (jobId.length < 16) {
    return { isValid: false, error: 'Invalid job ID format' };
  }
  
  return { isValid: true };
};

export const validatePrinterId = (printerId) => {
  if (!printerId || typeof printerId !== 'string') {
    return { isValid: false, error: 'Printer ID is required' };
  }
  
  if (printerId.length < 1) {
    return { isValid: false, error: 'Invalid printer ID' };
  }
  
  return { isValid: true };
};

export const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    return { isValid: false, error: 'User ID is required' };
  }
  
  if (userId.length < 1) {
    return { isValid: false, error: 'Invalid user ID' };
  }
  
  return { isValid: true };
};

// Sanitize input to prevent XSS and other security issues
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

// Validate and sanitize job data
export const sanitizeJobData = (jobData) => {
  const sanitized = { ...jobData };
  
  if (sanitized.documentName) {
    sanitized.documentName = sanitizeInput(sanitized.documentName);
  }
  
  if (sanitized.notes) {
    sanitized.notes = sanitizeInput(sanitized.notes);
  }
  
  if (sanitized.priority) {
    sanitized.priority = sanitizeInput(sanitized.priority.toLowerCase());
  }
  
  return sanitized;
};

// Comprehensive validation for print job release
export const validateJobRelease = (jobId, token, printerId, userId) => {
  const errors = {};
  
  const jobIdValidation = validateJobId(jobId);
  if (!jobIdValidation.isValid) {
    errors.jobId = jobIdValidation.error;
  }
  
  const tokenValidation = validateToken(token);
  if (!tokenValidation.isValid) {
    errors.token = tokenValidation.error;
  }
  
  const printerIdValidation = validatePrinterId(printerId);
  if (!printerIdValidation.isValid) {
    errors.printerId = printerIdValidation.error;
  }
  
  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.isValid) {
    errors.userId = userIdValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format validation errors for display
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return 'Validation failed';
  
  const errorMessages = Object.values(errors);
  if (errorMessages.length === 0) return '';
  
  if (errorMessages.length === 1) return errorMessages[0];
  
  return `Validation errors: ${errorMessages.join(', ')}`;
};

export default {
  validateEmail,
  validatePassword,
  validatePin,
  validateJobSubmission,
  validateFileUpload,
  validateToken,
  validateJobId,
  validatePrinterId,
  validateUserId,
  sanitizeInput,
  sanitizeJobData,
  validateJobRelease,
  formatValidationErrors
};