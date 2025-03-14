// validation/call.validation.js
const { Joi } = require('express-validation');

const callValidation = {
    initiateCall: {
        body: Joi.object({
            conversationId: Joi.string().required(),
            type: Joi.string().valid('audio', 'video').required(),
            participants: Joi.array().items(Joi.string()).min(1).required()
        })
    },
    answerCall: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    endCall: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    rejectCall: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            reason: Joi.string().valid('busy', 'declined', 'unavailable').optional()
        })
    },
    getCallHistory: {
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20),
            filter: Joi.string().valid('all', 'missed', 'incoming', 'outgoing').default('all')
        })
    },
    toggleVideo: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            enabled: Joi.boolean().required()
        })
    },
    toggleMute: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            muted: Joi.boolean().required()
        })
    }
};

module.exports = callValidation;
