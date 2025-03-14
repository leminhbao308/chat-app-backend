// validation/message.validation.js
const { Joi } = require('express-validation');

const messageValidation = {
    getMessages: {
        params: Joi.object({
            conversationId: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20),
            before: Joi.date().iso().optional()
        })
    },
    sendMessage: {
        params: Joi.object({
            conversationId: Joi.string().required()
        }),
        body: Joi.object({
            content: Joi.string().when('attachments', {
                is: Joi.exist(),
                then: Joi.optional(),
                otherwise: Joi.required()
            }),
            attachments: Joi.array().items(
                Joi.object({
                    type: Joi.string().valid('image', 'video', 'audio', 'file').required(),
                    url: Joi.string().uri().required(),
                    size: Joi.number().optional(),
                    name: Joi.string().optional(),
                    duration: Joi.number().optional() // For video/audio
                })
            ).optional(),
            replyTo: Joi.string().optional() // ID of message being replied to
        })
    },
    updateMessage: {
        params: Joi.object({
            conversationId: Joi.string().required(),
            messageId: Joi.string().required()
        }),
        body: Joi.object({
            content: Joi.string().required()
        })
    },
    deleteMessage: {
        params: Joi.object({
            conversationId: Joi.string().required(),
            messageId: Joi.string().required()
        })
    },
    reactToMessage: {
        params: Joi.object({
            conversationId: Joi.string().required(),
            messageId: Joi.string().required()
        }),
        body: Joi.object({
            reaction: Joi.string().required() // emoji code or name
        })
    },
    removeReaction: {
        params: Joi.object({
            conversationId: Joi.string().required(),
            messageId: Joi.string().required(),
            reactionId: Joi.string().required()
        })
    },
    getReadReceipts: {
        params: Joi.object({
            conversationId: Joi.string().required(),
            messageId: Joi.string().required()
        })
    },
    markRead: {
        params: Joi.object({
            conversationId: Joi.string().required()
        }),
        body: Joi.object({
            lastReadMessageId: Joi.string().optional() // If not provided, mark all as read
        })
    }
};

module.exports = messageValidation;
