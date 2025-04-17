import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";

const MessagesRepo = {
    async getMessagesInConversation(conversationId) {
        try {
            const id = mongoHelper.extractObjectId(conversationId);

            const result = await mongoHelper.aggregate(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                [
                    { $match: { _id: id } },
                    { $project: {
                            _id: 0,
                            messages: {
                                $sortArray: {
                                    input: "$messages",
                                    sortBy: { send_timestamp: 1 }
                                }
                            }
                        }}
                ]
            )

            // Kết quả sẽ có dạng [{ messages: [...] }]
            return result[0]?.messages || [];
        } catch (err) {
            console.error("Error getting message in conversation: ", err);
            return []
        }
    },
}

export default MessagesRepo
