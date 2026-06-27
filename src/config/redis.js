import { createClient } from "redis";
import logger from "./logger.js";

const redisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
});

redisClient.on("error", (err) => {
    logger.error({ err }, "Redis error");
});

redisClient.on("connect", () => {
    logger.info("Redis connected");
});

export const connectRedis = async () => {
    await redisClient.connect();
};

export default redisClient;
