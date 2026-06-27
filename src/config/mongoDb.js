import mongoose from "mongoose";
import logger from "./logger.js";

export const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        logger.info({ host: connect.connection.host }, "MongoDB connected");
    } catch (error) {
        logger.fatal({ err: error }, "MongoDB connection failed");
        process.exit(1);
    }
}