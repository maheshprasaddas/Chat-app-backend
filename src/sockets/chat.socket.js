import { getUser } from "../services/redisUser.service.js";
import { sendMessage, updateMessage, deleteMessage, getMessages, markAsDelivered } from "../services/message.service.js";
import { createDirectChat, getChatById } from "../services/chat.service.js";
import logger from "../config/logger.js";

export default function registerChatSocket(io, socket) {
  /*
        SEND MESSAGE
    */
  socket.on("send-message", async (payload) => {
    try {
      const {
        receiverId,
        chatId,
        content,
        messageType = "text",
        attachmentUrl = null,
        replyTo = null,
      } = payload;
      const senderId = socket.user.id;

      // Resolve or create the chat
      let resolvedChatId = chatId;
      if (!resolvedChatId && receiverId) {
        // Direct message — find or create the direct chat
        const chat = await createDirectChat(senderId, receiverId);
        resolvedChatId = chat._id;
      }

      if (!resolvedChatId) {
        logger.error({ senderId }, "No chatId or receiverId provided");
        return;
      }

      // Persist the message via the service layer
      const message = await sendMessage({
        chatId: resolvedChatId,
        senderId,
        content,
        messageType,
        attachmentUrl,
        replyTo,
      });

      // Fetch the chat to get all participants
      const chat = await getChatById(resolvedChatId);

      // Emit to all online participants and track delivery
      const deliveredToIds = [];
      for (const participant of chat.participants) {
        const participantId = participant._id.toString();
        const participantRedis = await getUser(participantId);

        if (participantRedis && participantRedis.socketId) {
          io.to(participantRedis.socketId).emit("receive-message", {
            message,
            chatId: resolvedChatId,
          });

          // Track delivery (skip the sender — they authored the message)
          if (participantId !== senderId) {
            deliveredToIds.push(participantId);
          }
        }
      }

      // Mark the message as delivered for all online recipients
      for (const recipientId of deliveredToIds) {
        await markAsDelivered([message._id], recipientId);
      }
    } catch (error) {
      logger.error({ err: error }, "Send message failed");
    }
  });

  /*
        EDIT MESSAGE
    */
  socket.on("edit-message", async (payload) => {
    try {
      const { messageId, chatId, newContent } = payload;
      const senderId = socket.user.id;

      const message = await updateMessage(messageId, senderId, newContent);

      // Notify all participants in the chat
      const chat = await getChatById(chatId);
      for (const participant of chat.participants) {
        const participantRedis = await getUser(participant._id.toString());
        if (participantRedis && participantRedis.socketId) {
          io.to(participantRedis.socketId).emit("message-edited", {
            messageId,
            chatId,
            newContent: message.content,
            editedAt: message.editedAt,
          });
        }
      }
    } catch (error) {
      logger.error({ err: error }, "Edit message failed");
    }
  });

  /*
        DELETE MESSAGE
    */
  socket.on("delete-message", async (payload) => {
    try {
      const { messageId, chatId } = payload;
      const senderId = socket.user.id;

      const message = await deleteMessage(messageId, senderId);

      // Notify all participants in the chat
      const chat = await getChatById(chatId);
      for (const participant of chat.participants) {
        const participantRedis = await getUser(participant._id.toString());
        if (participantRedis && participantRedis.socketId) {
          io.to(participantRedis.socketId).emit("message-deleted", {
            messageId,
            chatId,
            deletedAt: message.deletedAt,
          });
        }
      }
    } catch (error) {
      logger.error({ err: error }, "Delete message failed");
    }
  });

  /*
        FETCH MESSAGES (pagination)
    */
  socket.on("get-messages", async (payload, callback) => {
    try {
      const { chatId, page = 1, limit = 50 } = payload;
      const result = await getMessages(chatId, { page, limit });

      if (typeof callback === "function") {
        callback({ success: true, data: result });
      }
    } catch (error) {
      logger.error({ err: error }, "Get messages failed");
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
    }
  });

  /*
        TYPING INDICATOR
    */
  socket.on("typing", async ({ receiverId, chatId }) => {
    const senderId = socket.user.id;

    if (chatId) {
      // Group typing — notify all participants
      try {
        const chat = await getChatById(chatId);
        for (const participant of chat.participants) {
          const participantId = participant._id.toString();
          if (participantId !== senderId) {
            const participantRedis = await getUser(participantId);
            if (participantRedis && participantRedis.socketId) {
              io.to(participantRedis.socketId).emit("user-typing", {
                senderId,
                chatId,
              });
            }
          }
        }
      } catch (error) {
        logger.error({ err: error }, "Typing indicator failed");
      }
    } else if (receiverId) {
      // Direct typing — notify only the receiver
      const receiver = await getUser(receiverId);
      if (receiver && receiver.socketId) {
        io.to(receiver.socketId).emit("user-typing", {
          senderId,
        });
      }
    }
  });
}
