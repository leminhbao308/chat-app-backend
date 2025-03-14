// validation/media.validation.js
const { Joi } = require('express-validation');

const mediaValidation = {
    uploadMedia: {
        body: Joi.object({
            type: Joi.string().valid('image', 'video', 'audio', 'file').required(),
            file: Joi.any().required(), // This will be handled by multer middleware
            conversationId: Joi.string().optional() // Optional to associate with a conversation directly
        })
    },
    getMedia: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    deleteMedia: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    getConversationMedia: {
        params: Joi.object({
            conversationId: Joi.string().required()
        }),
        query: Joi.object({
            type: Joi.string().valid('image', 'video', 'audio', 'file', 'all').default('all'),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20)
        })
    }
};

module.exports = mediaValidation;
