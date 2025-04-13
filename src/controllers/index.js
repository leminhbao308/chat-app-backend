import AuthController from "./auth.controller.js";
import MessageController from "./message.controller.js";
import ConversationController from "./conversation.controller.js";

const controllers = {
    auth: AuthController,
    message: MessageController,
    conversation: ConversationController,
}

export default controllers
