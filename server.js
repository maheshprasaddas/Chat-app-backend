import 'dotenv/config';
import { app, server } from './src/app.js';
import { connectDB } from './src/config/mongoDb.js'
import { connectRedis } from './src/config/redis.js'
import redisClient from './src/config/redis.js'

connectDB();
connectRedis();

redisClient.set("foo", "bar");
const result = await redisClient.get("foo");
console.log(result)

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Port ${PORT} running`);
    console.log(`Swagger UI : http://localhost:${PORT}/api-docs`);

})
