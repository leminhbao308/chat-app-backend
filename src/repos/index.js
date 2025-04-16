import authRepo from "./auth.repo.js";
import usersRepo from "./users.repo.js";
import s3Repo from "./s3.repo.js";
import userAvatarsRepo from "./userAvatars.repo.js";
import conversationsRepo from "./conversations.repo.js";
import messagesRepo from "./messages.repo.js";
import contactsRepo from "./contacts.repo.js";

const repos = {
    auth: authRepo,
    users: usersRepo,
    s3: s3Repo,
    user_avatars: userAvatarsRepo,
    conversation: conversationsRepo,
    messages: messagesRepo,
    contact: contactsRepo
}

export default repos;
