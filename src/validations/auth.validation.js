// validation/auth.validation.js
const { Joi } = require('express-validation');

const authValidation = {
    register: {
        body: Joi.object({
            username: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            fullName: Joi.string().required(),
            avatar: Joi.string().uri().optional(),
            phoneNumber: Joi.string().optional()
        })
    },
    login: {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
            deviceId: Joi.string().optional(),
            deviceType: Joi.string().valid('mobile', 'web', 'desktop').optional()
        })
    },
    refreshToken: {
        body: Joi.object({
            refreshToken: Joi.string().required()
        })
    },
    resetPasswordRequest: {
        body: Joi.object({
            email: Joi.string().email().required()
        })
    },
    resetPassword: {
        body: Joi.object({
            token: Joi.string().required(),
            newPassword: Joi.string().min(6).required(),
            confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
                .messages({ 'any.only': 'Passwords do not match' })
        })
    },
    changePassword: {
        body: Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string().min(6).required(),
            confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
                .messages({ 'any.only': 'Passwords do not match' })
        })
    },
    verifyEmail: {
        params: Joi.object({
            token: Joi.string().required()
        })
    }
};

module.exports = authValidation;
