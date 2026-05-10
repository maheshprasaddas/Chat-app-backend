export const errorHandler = (err, req, res, next) => {
    console.error("\n Error => ",err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success : false,
        message : err.message || "Internal server error",
        error : err.errors || [],
        stack : process.env.NODE_ENV=="dev" ? err.stack : undefined,
    });
    
};