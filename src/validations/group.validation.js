// validation/group.validation.js
const { Joi } = require('express-validation');

const groupValidation = {
    createGroup: {
        body: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().optional(),
            members: Joi.array().items(Joi.string()).min(1).required(),
            image: Joi.string().uri().optional()
        })
    },
    getGroup: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    updateGroup: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            name: Joi.string().optional(),
            description: Joi.string().optional()
        })
    },
    addMember: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            userIds: Joi.array().items(Joi.string()).min(1).required()
        })
    },
    removeMember: {
        params: Joi.object({
            id: Joi.string().required(),
            userId: Joi.string().required()
        })
    },
    changeRole: {
        params: Joi.object({
            id: Joi.string().required(),
            userId: Joi.string().required()
        }),
        body: Joi.object({
            role: Joi.string().valid('admin', 'member').required()
        })
    },
    leaveGroup: {
        params: Joi.object({
            id: Joi.string().required()
        })
    },
    getMembers: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20)
        })
    },
    updateGroupImage: {
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            image: Joi.string().uri().required()
        })
    }
};

module.exports = groupValidation;
