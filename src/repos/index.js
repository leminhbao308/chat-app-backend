import authRepo from "./auth.repo.js";
import usersRepo from "./users.repo.js";

const repos = {
    auth: authRepo,
    users: usersRepo,
}

export default repos;
