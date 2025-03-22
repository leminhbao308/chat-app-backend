import { Joi } from 'express-validation';
import ValidationConstant from "../constants/validationConstant.js";

const messageValidation = {
    sendMessage: {
        params: Joi.object({
            conversation_id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            type: Joi.string().valid(
                ValidationConstant.MEDIA_TYPE.TXT,
                ValidationConstant.MEDIA_TYPE.IMG,
                ValidationConstant.MEDIA_TYPE.VID,
                ValidationConstant.MEDIA_TYPE.FILE,
                ValidationConstant.MEDIA_TYPE.AUD
            ).required(),
            content: Joi.string().when(ValidationConstant.CONVERSATION_ATT.TYPE, {
                is: ValidationConstant.MEDIA_TYPE.TXT,
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            }),
            reply_to_id: Joi.string().uuid().optional(),
            metadata: Joi.object().optional()
        })
    },

    updateMessage: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            content: Joi.string().required()
        })
    },

    deleteMessage: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        })
    },

    getMessage: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        })
    },

    listMessages: {
        params: Joi.object({
            conversation_id: Joi.string().uuid().required()
        }),
        query: Joi.object({
            before: Joi.date().iso().optional(),
            after: Joi.date().iso().optional(),
            limit: Joi.number().integer().min(1).max(100).default(50),
            type: Joi.string().valid(
                ValidationConstant.MEDIA_TYPE.TXT,
                ValidationConstant.MEDIA_TYPE.IMG,
                ValidationConstant.MEDIA_TYPE.VID,
                ValidationConstant.MEDIA_TYPE.FILE,
                ValidationConstant.MEDIA_TYPE.AUD
            ).optional()
        })
    },

    addReaction: {
        params: Joi.object({
            message_id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            reaction_type: Joi.string().required()
        })
    },

    removeReaction: {
        params: Joi.object({
            message_id: Joi.string().uuid().required(),
            reaction_id: Joi.string().uuid().required()
        })
    },

    markAsRead: {
        params: Joi.object({
            conversation_id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            last_read_message_id: Joi.string().uuid().required()
        })
    }
};

export default messageValidation;
