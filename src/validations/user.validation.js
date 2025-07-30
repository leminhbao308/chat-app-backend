import {Joi} from 'express-validation';
import ValidationConstant from "../constants/validation.constant.js";

const userValidation = {
    getUserById: {
        params: Joi.object({
            id: Joi.string().required().length(24)
        })
    },

    getUserByPhone: {
        query: Joi.object({
            phone_number: Joi.string().min(5).required()
        })
    },

    updateUser: {
        body: Joi.object({
            first_name: Joi.string().optional(),
            last_name: Joi.string().optional(),
            gender: Joi.string().optional().valid(ValidationConstant.GENDER.M, ValidationConstant.GENDER.F),
            date_of_birth: Joi.string()
                .pattern(ValidationConstant.REGEX.DATE).optional()
                .messages({ 'string.pattern.base': 'Date of birth must be in DD-MM-YYYY format' }),
            avatar_url: Joi.string().uri().optional(),
            thumbnail_url: Joi.string().uri().optional(),
            phone_number: Joi.string()
                .pattern(ValidationConstant.REGEX.PHONE).optional()
                .messages({ 'string.pattern.base': 'Phone number must be a valid international format' }),
            is_active: Joi.boolean().optional()
        })
    },

    searchUsers: {
        query: Joi.object({
            search: Joi.string().optional(),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(10),
            sort_by: Joi.string().valid(
                ValidationConstant.USER_ATT.FIRST_NAME,
                ValidationConstant.USER_ATT.LAST_NAME,
                ValidationConstant.AUDIT.CREATED,
                ValidationConstant.USER_ATT.LAST_LOGIN
            ).default(ValidationConstant.AUDIT.CREATED),
            sort_order: Joi.string().valid(
                ValidationConstant.SORT.ASC,
                ValidationConstant.SORT.DESC
            ).default(ValidationConstant.SORT.DESC)
        })
    },

    toggleUserStatus: {
        body: Joi.object({
            online_status: Joi.string().required().valid('online', 'offline', 'busy')
        })
    }
};

export default userValidation;
