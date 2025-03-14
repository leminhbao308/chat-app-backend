// validation/conversation.validation.js
const { Joi } = require('express-validation');

const conversationValidation = {
    createConversation: {
        body: Joi.object({
            participantId: Joi.string().required(), // For direct conversations
            type: Joi.string().valid('direct', 'group').default('direct'),
            groupName: Joi.string().when('type', {
                is: 'group',
                then: Joi.required(),
                otherwise: Joi.forbidden()
            }),
            participants: Joi.array().items(Joi.string()).when('type', {
                is: 'group',
                then: Joi.required(),
                otherwise: Joi.forbidden()
            })
        })
    },
    getConversations: {
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20),
            filter: Joi.string().valid('all', 'unread', 'archived').default('all')
        })
    },
    getConversation: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    archiveConversation: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    deleteConversation: {
        params: Joi.object({
            id: Joi.string().required()
        })
    }
};

module.exports = conversationValidation;
