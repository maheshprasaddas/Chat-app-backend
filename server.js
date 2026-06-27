import 'dotenv/config';
import { app, server } from './src/app.js';
import { connectDB } from './src/config/mongoDb.js'
import { connectRedis } from './src/config/redis.js'
import redisClient from './src/config/redis.js'
import logger from './src/config/logger.js'

connectDB();
connectRedis();

const PORT = process.env.PORT;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger UI: http://localhost:${PORT}/api-docs`);

})
