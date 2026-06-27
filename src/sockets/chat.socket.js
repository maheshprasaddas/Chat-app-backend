import {
  getUser,
} from "../services/redisUser.service.js";
import logger from "../config/logger.js";

export default function registerChatSocket(io, socket) {
  /*
        SEND MESSAGE
    */
  socket.on("send-message", async (payload) => {
    try {
      const { receiverId, message } = payload;
      const senderId = socket.user.id;

      const receiver = await getUser(receiverId);

      if (!receiver || !receiver.socketId) {
        logger.debug({ senderId, receiverId }, "Receiver is offline");
        return;
      }

      io.to(receiver.socketId).emit("receive-message", {
        senderId,
        receiverId,
        message,
        sentAt: Date.now(),
      });
    } catch (error) {
      logger.error({ err: error }, "Send message failed");
    }
  });

  /*
        TYPING INDICATOR
    */
  socket.on("typing", async ({ receiverId }) => {
    const senderId = socket.user.id;
    const receiver = await getUser(receiverId);

    if (receiver && receiver.socketId) {
      io.to(receiver.socketId).emit("user-typing", {
        senderId,
      });
    }
  });
}
