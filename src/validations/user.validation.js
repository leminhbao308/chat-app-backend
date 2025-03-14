// validation/user.validation.js
const { Joi } = require('express-validation');

const userValidation = {
    updateProfile: {
        body: Joi.object({
            fullName: Joi.string().optional(),
            bio: Joi.string().max(200).optional(),
            phoneNumber: Joi.string().optional(),
            avatar: Joi.string().uri().optional(),
            dateOfBirth: Joi.date().iso().optional(),
            gender: Joi.string().valid('male', 'female', 'other').optional(),
            location: Joi.string().optional()
        })
    },
    searchUsers: {
        query: Joi.object({
            query: Joi.string().required(),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20)
        })
    },
    getFriends: {
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20)
        })
    },
    addFriend: {
        body: Joi.object({
            userId: Joi.string().required()
        })
    },
    respondFriendRequest: {
        params: Joi.object({
            requestId: Joi.string().required()
        }),
        body: Joi.object({
            action: Joi.string().valid('accept', 'reject').required()
        })
    },
    blockUser: {
        params: Joi.object({
            userId: Joi.string().required()
        })
    }
};

module.exports = userValidation;
