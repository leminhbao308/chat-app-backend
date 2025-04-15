import {Joi} from 'express-validation';
import ValidationConstant from "../constants/validation.constant.js";

const conversationValidation = {
    createConversation: {
        body: Joi.object({
            name: Joi.when(ValidationConstant.CONVERSATION_ATT.TYPE, {
                is: ValidationConstant.CONVERSATION_TYPE.GROUP,
                then: Joi.string().min(1).max(100).required(),
                otherwise: Joi.string().min(1).max(100).optional()
            }),
            type: Joi.string().valid(
                ValidationConstant.CONVERSATION_TYPE.PRIVATE,
                ValidationConstant.CONVERSATION_TYPE.GROUP
            ).required(),
            description: Joi.string().max(500).optional(),
            avatar_url: Joi.string().uri().optional(),
            members: Joi.array().items(
                Joi.object({
                    user_id: Joi.string().uuid().required(),
                    role: Joi.string().valid(
                        ValidationConstant.GROUP_ROLE.ADMIN,
                        ValidationConstant.GROUP_ROLE.MEM
                    ).default(ValidationConstant.GROUP_ROLE.MEM)
                })
            ).min(1).when(ValidationConstant.CONVERSATION_ATT.TYPE, {
                is: ValidationConstant.CONVERSATION_TYPE.PRIVATE,
                then: Joi.array().max(1),
                otherwise: Joi.array().min(1).max(100)
            })
        })
    },

    updateConversation: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            name: Joi.string().min(1).max(100).optional(),
            description: Joi.string().max(500).optional(),
            avatar_url: Joi.string().uri().optional()
        })
    },

    getConversation: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        })
    },

    listConversations: {
        query: Joi.object({
            type: Joi.string().valid(
                ValidationConstant.CONVERSATION_TYPE.PRIVATE,
                ValidationConstant.CONVERSATION_TYPE.GROUP
            ).optional(),
            search: Joi.string().optional(),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(10),
            sort_by: Joi.string().valid(
                ValidationConstant.AUDIT.UPDATED,
                ValidationConstant.AUDIT.CREATED,
                ValidationConstant.CONVERSATION_ATT.NAME
            ).default(ValidationConstant.AUDIT.UPDATED),
            sort_order: Joi.string().valid(
                ValidationConstant.SORT.ASC,
                ValidationConstant.SORT.DESC
            ).default(ValidationConstant.SORT.DESC)
        })
    },

    addMembers: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            members: Joi.array().items(
                Joi.object({
                    user_id: Joi.string().uuid().required(),
                    role: Joi.string().valid(
                        ValidationConstant.GROUP_ROLE.ADMIN,
                        ValidationConstant.GROUP_ROLE.MEM
                    ).default(ValidationConstant.GROUP_ROLE.MEM)
                })
            ).min(1).required()
        })
    },

    updateMember: {
        params: Joi.object({
            conversation_id: Joi.string().uuid().required(),
            user_id: Joi.string().uuid().required()
        }),
        body: Joi.object({
            role: Joi.string().valid(
                ValidationConstant.GROUP_ROLE.ADMIN,
                ValidationConstant.GROUP_ROLE.ADMIN
            ).optional(),
            is_muted: Joi.boolean().optional(),
            is_pinned: Joi.boolean().optional()
        })
    },

    removeMember: {
        params: Joi.object({
            conversation_id: Joi.string().uuid().required(),
            user_id: Joi.string().uuid().required()
        })
    },

    leaveConversation: {
        params: Joi.object({
            id: Joi.string().uuid().required()
        })
    }
};

export default conversationValidation;
