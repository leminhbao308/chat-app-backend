import mongoHelper from "../helper/MongoHelper.js";
import DatabaseConstant from "../constants/database.constant.js";

const ConversationsRepo = {
    async getConversationsForUser(userId) {
        try {
            const id = mongoHelper.extractObjectId(userId);

            const conversations = await mongoHelper.find(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {participants: id}
            )

            return conversations || []
        } catch (err) {
            console.error("Error getting conversations: ", err)
            return []
        }
    }
}

export default ConversationsRepo
