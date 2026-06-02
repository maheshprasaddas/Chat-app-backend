import dotenv from 'dotenv';
import { app } from './src/app.js';
import { connectDB } from './src/config/mongoDb.js'
dotenv.config();

connectDB();
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Port ${PORT} running`);
    console.log(`Swagger UI : http://localhost:${PORT}/api-docs`);
    
})
