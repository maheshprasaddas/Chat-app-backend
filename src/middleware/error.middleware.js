import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
    logger.error({ err, method: req.method, url: req.originalUrl }, "Unhandled error");

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success : false,
        message : err.message || "Internal server error",
        error : err.errors || [],
        stack : process.env.NODE_ENV=="dev" ? err.stack : undefined,
    });
    
};