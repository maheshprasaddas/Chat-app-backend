import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
//import {connectDB} from './config/mongoDb.js'


const app = express();
//connectDB();
app.use(express.json());
app.use('/',()=>{
    console.log("server started..and..routes are available to serve");
    
})

// Global Error Middleware
app.use(errorHandler)

export {app}