import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import path from 'path';
import { errorHandler } from './middleware/error.middleware.js';
import userRoutes from './routes/user.routes.js';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Swagger YAML spec
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/', userRoutes);

// Global Error Middleware
app.use(errorHandler);

export { app };