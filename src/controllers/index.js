import AuthController from "./auth.controller.js";
import MessageController from "./message.controller.js";
import ConversationController from "./conversation.controller.js";
import SocketController from "./socket.controller.js";
import ContactController from "./contact.controller.js";
import UserController from "./user.controller.js";

const controllers = {
    auth: AuthController,
    user: UserController,
    message: MessageController,
    conversation: ConversationController,
    socket: SocketController,
    contact: ContactController,
}

export default controllers
