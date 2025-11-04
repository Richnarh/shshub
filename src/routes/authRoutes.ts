import express from 'express';
import { DataSource } from 'typeorm';
import { AuthController } from '../controller/authController.js';

export const setupAuthRoutes = (datasource:DataSource) => {
    const router = express.Router();
    const controller = new AuthController(datasource);

    router.post('/signup', controller.signup.bind(controller));
    router.post('/login', controller.doLogin.bind(controller));

    return router;
}