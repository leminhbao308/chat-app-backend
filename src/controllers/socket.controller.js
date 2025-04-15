import StatusConstant from "../constants/status.constant.js";
import ResponseUtils from "../utils/response.js";
import SocketConstant from "../constants/socket.constant.js";

const SocketController = {

    async getConstants(req, res) {
        try {
            res.status(StatusConstant.OK)
                .json(ResponseUtils.successResponse("Get all socket constants successfully", SocketConstant))
        } catch (err) {
            console.error("Error getting socket constants:", err);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR)
                .json(ResponseUtils.serverErrorResponse("Failed to get socket constants"));
        }
    }
}

export default SocketController
