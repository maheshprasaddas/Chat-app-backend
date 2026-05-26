import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
//import {connectDB} from './config/mongoDb.js'


const app = express();
//connectDB();
app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use('/',()=>{
    console.log("server started..and..routes are available to serve");
    
})

// Global Error Middleware
app.use(errorHandler)

export {app}