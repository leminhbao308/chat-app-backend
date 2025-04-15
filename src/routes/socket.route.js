import express from "express";
import ApiConstant from "../constants/api.constant.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import controllers from "../controllers/index.js";

const SocketRouter = express.Router();

SocketRouter.get(
    ApiConstant.WEBSOCKET.CONSTANTS.path,
    AuthMiddleware,
    controllers.socket.getConstants
    )

export default SocketRouter
