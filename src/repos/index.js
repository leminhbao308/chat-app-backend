import authRepo from "./auth.repo.js";
import usersRepo from "./users.repo.js";
import s3Repo from "./s3.repo.js";
import userAvatarsRepo from "./userAvatars.repo.js";

const repos = {
    auth: authRepo,
    users: usersRepo,
    s3: s3Repo,
    user_avatars: userAvatarsRepo
}

export default repos;
