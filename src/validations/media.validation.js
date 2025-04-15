import {Joi} from 'express-validation';
import validationConstant from "../constants/validation.constant.js";
import ValidationConstant from "../constants/validation.constant.js";

const mediaValidation = {
    uploadMedia: {
        params: Joi.object({
            conversation_id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            message_id: Joi.string().uuid().optional(),
            type: Joi.string().valid(
                ValidationConstant.MEDIA_TYPE.IMG,
                ValidationConstant.MEDIA_TYPE.VID,
                ValidationConstant.MEDIA_TYPE.AUD,
                ValidationConstant.MEDIA_TYPE.DOC
            ).required(),
            filename: Joi.string().required(),
            mime_type: Joi.string().required(),
            size: Joi.number().integer().positive().required(),
            metadata: Joi.object().optional()
        })
    },

    getMedia: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        })
    },

    deleteMedia: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        })
    },

    listMediaByConversation: {
        params: Joi.object({
            conversation_id: Joi.string().uuid().required()
        }),
        query: Joi.object({
            type: Joi.string().valid(
                validationConstant.MEDIA_TYPE.IMG,
                validationConstant.MEDIA_TYPE.VID,
                validationConstant.MEDIA_TYPE.AUD,
                validationConstant.MEDIA_TYPE.DOC).optional(),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(50),
            sort_by: Joi.string().valid(
                ValidationConstant.AUDIT.CREATED,
                ValidationConstant.MEDIA_SIZE,
                ValidationConstant.MEDIA_NAME)
                .default(ValidationConstant.AUDIT.CREATED),
            sort_order: Joi.string().valid(
                ValidationConstant.SORT.ASC,
                ValidationConstant.SORT.DESC)
                .default(ValidationConstant.SORT.DESC)
        })
    },

    listMediaByMessage: {
        params: Joi.object({
            message_id: Joi.string().uuid().required()
        }),
        query: Joi.object({
            type: Joi.string().valid(
                validationConstant.MEDIA_TYPE.IMG,
                validationConstant.MEDIA_TYPE.VID,
                validationConstant.MEDIA_TYPE.AUD,
                validationConstant.MEDIA_TYPE.DOC).optional()
        })
    },

    generatePresignedUrl: {
        body: Joi.object({
            type: Joi.string().valid(
                validationConstant.MEDIA_TYPE.IMG,
                validationConstant.MEDIA_TYPE.VID,
                validationConstant.MEDIA_TYPE.AUD,
                validationConstant.MEDIA_TYPE.DOC).optional(),
            filename: Joi.string().required(),
            mime_type: Joi.string().required(),
            size: Joi.number().integer().positive().required()
        })
    }
};

export default mediaValidation;
