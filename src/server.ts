import express from 'express';
import { DataSource } from 'typeorm';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

import { initializeDatabase } from './config/dataSource.js';
import { logger } from './utils/logger.js';
import swaggerDocument from './swagger.json' with { type: 'json' };
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { setupStudentRoutes } from './routes/studentRoutes.js';
import { setupAdmissionRoutes } from './routes/admissionRoutes.js';
import { setupRegionRoutes } from './routes/regionRoutes.js';
import { setupDistrictRoutes } from './routes/districtRoutes.js';
import { setupHometownRoutes } from './routes/hometownRoutes.js';
import { setupSchoolRoutes } from './routes/schoolRoutes.js';
import { setupAccommodationRoutes } from './routes/accommodationRoutes.js';
import { setupAuthRoutes } from './routes/authRoutes.js';
import { setupHouseRoutes } from './routes/houseRoutes.js';
import { setupLookupRoutes } from './routes/lookupRoutes.js';
import { setupProgramRoutes } from './routes/programRoutes.js';
import { setupUserRoutes } from './routes/userRoutes.js';
import { setupClassesRoutes } from './routes/classRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseApi = '/api/v1';
const createApp = async (): Promise<express.Application> => {
  const dataSource: DataSource = await initializeDatabase();

  const app = express();
  const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  };

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());
  app.use(cors(corsOptions));

  app.use((req, res, next) => {
  if (req.path === '/api/v1/api-docs' || req.path.startsWith('/api/v1/docs')) {
    return next();
  }
    next();
  });
  
  app.use(`${baseApi}/docs`, express.static(path.join(__dirname, '..', 'node_modules', 'swagger-ui-dist')));
  app.use(
    `${baseApi}/api-docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCssUrl: `${baseApi}/docs/swagger-ui.css`,
      customJs: [
        `${baseApi}/docs/swagger-ui-bundle.js`,
        `${baseApi}/docs/swagger-ui-standalone-preset.js`
      ]
    })
  );

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  const routeConfigs = {
    'auth': () => setupAuthRoutes(dataSource),
    'students': () => setupStudentRoutes(dataSource),
    'admissions': () => setupAdmissionRoutes(dataSource),
    'regions': () => setupRegionRoutes(dataSource),
    'districts': () => setupDistrictRoutes(dataSource),
    'hometowns': () => setupHometownRoutes(dataSource),
    'schools': () => setupSchoolRoutes(dataSource),
    'classes': () => setupClassesRoutes(dataSource),
    'accommodations': () => setupAccommodationRoutes(dataSource),
    'houses': () => setupHouseRoutes(dataSource),
    'programs': () => setupProgramRoutes(dataSource),
    'users': () => setupUserRoutes(dataSource),
    'lookups': () => setupLookupRoutes(dataSource),
  };

  Object.entries(routeConfigs).forEach(([path, setup]) => {
    app.use(`${baseApi}/${path}`, setup());
  });

  app.use(errorMiddleware);
  return app;
};

const startEngine = async () => {
  const app = await createApp();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger UI available at http://localhost:${PORT}${baseApi}/api-docs`);
  });
};

startEngine().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});