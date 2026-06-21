import {
  saveUserSocket,
  getUser,
  setOffline,
} from "../services/redisUser.service.js";

export default function registerChatSocket(io, socket) {
  /*
        USER JOIN
    */
  socket.on("join", async ({ userId }) => {
    try {
      socket.userId = userId;

      await saveUserSocket(userId, socket.id);

      console.log(`${userId} connected (${socket.id})`);
    } catch (error) {
      console.error("Join Error:", error);
    }
  });

  /*
        SEND MESSAGE
    */
  socket.on("send-message", async (payload) => {
    try {
      const { senderId, receiverId, message } = payload;

      const receiver = await getUser(receiverId);

      if (!receiver || !receiver.socketId) {
        console.log(`Receiver ${receiverId} is offline`);

        return;
      }

      io.to(receiver.socketId).emit("receive-message", {
        senderId,
        receiverId,
        message,
        sentAt: Date.now(),
      });
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  });

  /*
        TYPING INDICATOR
    */
  socket.on("typing", async ({ senderId, receiverId }) => {
    const receiver = await getUser(receiverId);

    if (receiver && receiver.socketId) {
      io.to(receiver.socketId).emit("user-typing", {
        senderId,
      });
    }
  });

  /*
        DISCONNECT
    */
  socket.on("disconnect", async () => {
    try {
      if (!socket.userId) {
        return;
      }

      await setOffline(socket.userId);

      console.log(`${socket.userId} disconnected`);
    } catch (error) {
      console.error("Disconnect Error:", error);
    }
  });
}
