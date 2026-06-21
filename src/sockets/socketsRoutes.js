import registerChatSocket from "./chat.socket.js";

export default function initializeSocket(io) {
    io.on("connection", (socket) => {
        console.log(`Connected: ${socket.id}`);
        registerChatSocket(io, socket);
        socket.on("disconnect", () => {
            console.log(`Disconnected: ${socket.id}`);
        });
    });
}