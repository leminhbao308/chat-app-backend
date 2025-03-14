// validation/notification.validation.js
const { Joi } = require('express-validation');

const notificationValidation = {
    getNotifications: {
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20),
            filter: Joi.string().valid('all', 'unread').default('all')
        })
    },
    markNotificationRead: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    markAllNotificationsRead: {
        // No validation needed for this endpoint
    },
    updateNotificationSettings: {
        body: Joi.object({
            email: Joi.boolean().default(true),
            push: Joi.boolean().default(true),
            messageSounds: Joi.boolean().default(true),
            callSounds: Joi.boolean().default(true),
            friendRequestEnabled: Joi.boolean().default(true),
            messagePreviewEnabled: Joi.boolean().default(true),
            doNotDisturb: Joi.boolean().default(false),
            doNotDisturbSchedule: Joi.object({
                enabled: Joi.boolean().default(false),
                startTime: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
                endTime: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
            }).optional()
        })
    }
};

module.exports = notificationValidation;
