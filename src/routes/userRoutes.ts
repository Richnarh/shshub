import express from 'express';
import { DataSource } from 'typeorm';
import { UserController } from '../controller/UserController.js';

export const setupUserRoutes = (datasource:DataSource) => {
    const router = express.Router();
    const controller = new UserController(datasource);

    router.put('/', controller.save.bind(controller));
    router.get('/', controller.getAllUsers.bind(controller));
    router.get('/:id', controller.getUserById.bind(controller));
    router.delete('/:id', controller.deleteUser.bind(controller));

    return router;
}