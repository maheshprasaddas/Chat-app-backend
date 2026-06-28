import registerChatSocket from "./chat.socket.js";
import socketAuthMiddleware from "../middleware/socketAuth.middleware.js";
import {
    saveUserSocket,
    setOffline,
} from "../services/redisUser.service.js";
import { getUserChats } from "../services/chat.service.js";
import { getUndeliveredMessages, markAsDelivered } from "../services/message.service.js";
import logger from "../config/logger.js";

export default function initializeSocket(io) {
    // Authenticate every socket connection before allowing it through
    io.use(socketAuthMiddleware);

    io.on("connection", async (socket) => {
        const userId = socket.user.id;
        socket.userId = userId;

        await saveUserSocket(userId, socket.id);
        logger.info({ userId, socketId: socket.id }, "Socket connected");

        // ─── SYNC UNDELIVERED MESSAGES ──────────────────────
        // Deliver any messages the user missed while offline
        try {
            const chats = await getUserChats(userId);
            const chatIds = chats.map((chat) => chat._id);

            const undelivered = await getUndeliveredMessages(userId, chatIds);

            if (undelivered.length > 0) {
                // Group messages by chatId for organized delivery
                const grouped = {};
                for (const msg of undelivered) {
                    const cid = msg.chatId.toString();
                    if (!grouped[cid]) grouped[cid] = [];
                    grouped[cid].push(msg);
                }

                // Emit each chat's missed messages
                for (const [chatId, messages] of Object.entries(grouped)) {
                    socket.emit("undelivered-messages", {
                        chatId,
                        messages,
                        count: messages.length,
                    });
                }

                // Mark all as delivered
                const messageIds = undelivered.map((msg) => msg._id);
                await markAsDelivered(messageIds, userId);

                logger.info(
                    { userId, count: undelivered.length },
                    "Synced undelivered messages"
                );
            }
        } catch (error) {
            logger.error({ err: error, userId }, "Failed to sync undelivered messages");
        }

        registerChatSocket(io, socket);

        socket.on("disconnect", async () => {
            await setOffline(userId);
            logger.info({ userId, socketId: socket.id }, "Socket disconnected");
        });
    });
}