import authValidation from './auth.validation.js';
import userValidation from './user.validation.js';
import contactValidation from './contact.validation.js';
import conversationValidation from './conversation.validation.js';
import messageValidation from './message.validation.js';
import mediaValidation from './media.validation.js';

const validations = {
    auth: authValidation,
    user: userValidation,
    contact: contactValidation,
    conversation: conversationValidation,
    message: messageValidation,
    media: mediaValidation
};

export default validations;
