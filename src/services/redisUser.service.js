// redisUser.service.js

import redisClient from "../config/redis.js";

export const saveUserSocket = async (userId, socketId) => {
  await redisClient.hSet(`chat:user:${userId}`, {
    socketId,
    status: "online",
    connectedAt: Date.now(),
  });
};

export const getUser = async (userId) => {
  return await redisClient.hGetAll(`chat:user:${userId}`);
};

export const setOffline = async (userId) => {
  await redisClient.del(`chat:user:${userId}`);
};
