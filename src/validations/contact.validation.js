import {Joi} from 'express-validation';
import ValidationConstant from "../constants/validationConstant.js";
import validationConstant from "../constants/validationConstant.js";

const contactValidation = {
    addContact: {
        body: Joi.object({
            contact_id: Joi.string().uuid().required(),
            nickname: Joi.string().max(50).optional(),
            notes: Joi.string().max(200).optional()
        })
    },

    updateContact: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            nickname: Joi.string().max(50).optional(),
            notes: Joi.string().max(200).optional(),
            status: Joi.string().valid(
                ValidationConstant.CONTACT_STATUS.PENDING,
                ValidationConstant.CONTACT_STATUS.ACCEPTED,
                ValidationConstant.CONTACT_STATUS.BLOCKED
            ).optional()
        })
    },

    getContact: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        })
    },

    deleteContact: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        })
    },

    listContacts: {
        query: Joi.object({
            status: Joi.string().valid(
                ValidationConstant.CONTACT_STATUS.PENDING,
                ValidationConstant.CONTACT_STATUS.ACCEPTED,
                validationConstant.CONTACT_STATUS.BLOCKED
            ).optional(),
            search: Joi.string().optional(),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(10),
            sort_by: Joi.string().valid(
                ValidationConstant.CONTACT_NICKNAME,
                ValidationConstant.AUDIT.CREATED,
                ValidationConstant.CONTACT_LAST_INTERACTION
            ).default(ValidationConstant.AUDIT.CREATED),
            sort_order: Joi.string().valid(
                ValidationConstant.SORT.ASC,
                ValidationConstant.SORT.DESC
            ).default(ValidationConstant.SORT.DESC)
        })
    },

    respondToContactRequest: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            status: Joi.string().valid(
                ValidationConstant.CONTACT_STATUS.ACCEPTED,
                ValidationConstant.CONTACT_STATUS.BLOCKED
            ).required()
        })
    }
};

export default contactValidation;
