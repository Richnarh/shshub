import express from 'express';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors'
import helmet from 'helmet';

import { initializeDatabase } from './config/dataSource.js';
import { logger } from './utils/logger.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import swaggerSpec from './swagger.json' with { type: 'json' };
import { setupStudentRoutes } from './routes/studentRoutes.js';
import { setupAdmissionRoutes } from './routes/admissionRoutes.js';
import { setupRegionRoutes } from './routes/regionRoutes.js';
import { setupDistrictRoutes } from './routes/districtRoutes.js';

const createApp = async (): Promise<express.Application> => {
  const dataSource: DataSource = await initializeDatabase();

  const app = express();
  const baseApi = '/api/v1'
  const corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  };

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }))
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(`${baseApi}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  const routeConfigs = {
    'students': () => setupStudentRoutes(dataSource),
    'admissions': () => setupAdmissionRoutes(dataSource),
    'regions': () => setupRegionRoutes(dataSource),
    'districts': () => setupDistrictRoutes(dataSource)
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
    logger.info(`Swagger UI available at http://localhost:${PORT}/api/v1/docs`)
  });
}

startEngine().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});