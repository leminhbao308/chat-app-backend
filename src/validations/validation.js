// validation/index.js
const authValidation = require('./auth.validation.js');
const userValidation = require('./user.validation.js');
const conversationValidation = require('./conversation.validation.js');
const messageValidation = require('./message.validation.js');
const groupValidation = require('./group.validation.js');
const mediaValidation = require('./media.validation.js');
const callValidation = require('./call.validation.js');
const notificationValidation = require('./notification.validation.js');
const settingValidation = require('./setting.validation.js');

const Validation = {
  authValidation,
  userValidation,
  conversationValidation,
  messageValidation,
  groupValidation,
  mediaValidation,
  callValidation,
  notificationValidation,
  settingValidation
};

export default Validation;
