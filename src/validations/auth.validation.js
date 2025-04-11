import {Joi} from 'express-validation';
import ValidationConstant from "../constants/validation.constant.js";
import S3Constant from "../constants/s3.constant.js";

const authValidation = {
    register: {
        body: Joi.object({
            first_name: Joi.string().optional().default("New"),
            last_name: Joi.string().optional().default("User"),
            gender: Joi.string().valid(
                ValidationConstant.GENDER.M,
                ValidationConstant.GENDER.F
            ).optional().default(ValidationConstant.GENDER.M),
            date_of_birth: Joi.string().pattern(ValidationConstant.REGEX.DATE).optional().default('01-01-1999')
                .messages({'string.pattern.base': 'Date of birth must be in DD-MM-YYYY format'}),
            password: Joi.string().min(8).required()
                .pattern(ValidationConstant.REGEX.PASSWORD)
                .messages({
                    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
                }),
            avatar_url: Joi.string().uri().optional().default(S3Constant.DEFAULT_USER_AVATAR_URL),
            phone_number: Joi.string().pattern(ValidationConstant.REGEX.PHONE).required()
                .messages({'string.pattern.base': 'Phone number must be a valid international format'})
        })
    },

    login: {
        body: Joi.object({
            phone_number: Joi.string().required(),
            password: Joi.string().required(),
            device_id: Joi.string().optional(),
            device_type: Joi.string().valid(
                ValidationConstant.DEVICE_TYPE.MOB,
                ValidationConstant.DEVICE_TYPE.WEB
            ).optional()
        })
    },

    refreshToken: {
        body: Joi.object({
            refresh_token: Joi.string().required()
        })
    },

    resetPasswordRequest: {
        body: Joi.object({
            phone_number: Joi.string().required()
        })
    },

    verifyPasswordResetCode: {
        body: Joi.object({
            phone_number: Joi.string().required(),
            reset_code: Joi.string().length(6)
                .pattern(ValidationConstant.REGEX.SIX_DIGIT_CODE).required()
                .messages({'string.pattern.base': 'Reset code must be 6 digits'})
        })
    },

    resetPassword: {
        body: Joi.object({
            phone_number: Joi.string().required(),
            reset_code: Joi.string().length(6)
                .pattern(ValidationConstant.REGEX.SIX_DIGIT_CODE).required()
                .messages({'string.pattern.base': 'Reset code must be 6 digits'}),
            new_password: Joi.string().min(8).required()
                .pattern(ValidationConstant.REGEX.PASSWORD)
                .messages({
                    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
                })
        })
    },

    changePassword: {
        body: Joi.object({
            current_password: Joi.string().required(),
            new_password: Joi.string().min(8).required()
                .pattern(ValidationConstant.REGEX.PASSWORD)
                .messages({
                    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
                })
        })
    },

    updateProfile: {
        body: Joi.object({
            first_name: Joi.string().optional(),
            last_name: Joi.string().optional(),
            date_of_birth: Joi.string().pattern(ValidationConstant.REGEX.DATE).optional()
                .messages({'string.pattern.base': 'Date of birth must be in DD-MM-YYYY format'}),
            avatar_url: Joi.string().uri().optional(),
            phone_number: Joi.string().pattern(ValidationConstant.REGEX.PHONE).optional()
                .messages({'string.pattern.base': 'Phone number must be a valid international format'})
        })
    },

    verifyPhoneNumber: {
        body: Joi.object({
            phone_number: Joi.string().required(),
            verification_code: Joi.string().length(6)
                .pattern(ValidationConstant.REGEX.SIX_DIGIT_CODE).required()
                .messages({'string.pattern.base': 'Verification code must be 6 digits'})
        })
    }
};

export default authValidation;
