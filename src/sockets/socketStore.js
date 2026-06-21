import redisClient from "../config/redis.js";

export const addUser = async (userId, socketId) => {
    await redisClient.set(
        `user:${userId}`,
        socketId
    );
};

export const getSocketId = async (userId) => {
    return await redisClient.get(
        `user:${userId}`
    );
};

export const removeUser = async (userId) => {
    await redisClient.del(
        `user:${userId}`
    );
};