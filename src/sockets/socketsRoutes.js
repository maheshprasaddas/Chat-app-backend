import registerChatSocket from "./chat.socket.js";
import socketAuthMiddleware from "../middleware/socketAuth.middleware.js";
import {
    saveUserSocket,
    setOffline,
} from "../services/redisUser.service.js";
import logger from "../config/logger.js";

export default function initializeSocket(io) {
    // Authenticate every socket connection before allowing it through
    io.use(socketAuthMiddleware);

    io.on("connection", async (socket) => {
        const userId = socket.user.id;
        socket.userId = userId;

        await saveUserSocket(userId, socket.id);
        logger.info({ userId, socketId: socket.id }, "Socket connected");

        registerChatSocket(io, socket);

        socket.on("disconnect", async () => {
            await setOffline(userId);
            logger.info({ userId, socketId: socket.id }, "Socket disconnected");
        });
    });
}