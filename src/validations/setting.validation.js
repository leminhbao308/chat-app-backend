// validation/setting.validation.js
const { Joi } = require('express-validation');

const settingValidation = {
  getSettings: {
    // No validation needed
  },
  updateSettings: {
    body: Joi.object({
      language: Joi.string().valid('en', 'vi').optional(),
      theme: Joi.string().valid('light', 'dark', 'system').optional(),
      textSize: Joi.string().valid('small', 'medium', 'large').optional(),
      autoplayMedia: Joi.boolean().optional(),
      sendWithEnter: Joi.boolean().optional(),
      readReceipts: Joi.boolean().optional(),
      onlineStatus: Joi.boolean().optional(),
      displayLastSeen: Joi.boolean().optional(),
      privacySettings: Joi.object({
        profileVisibility: Joi.string().valid('everyone', 'friends', 'none').optional(),
        messageRequests: Joi.string().valid('everyone', 'friends', 'none').optional(),
        callRequests: Joi.string().valid('everyone', 'friends', 'none').optional()
      }).optional()
    })
  }
};

module.exports = settingValidation;
