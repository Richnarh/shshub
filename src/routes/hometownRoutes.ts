import express from 'express';
import { DataSource } from 'typeorm';
import { HometownController } from '../controller/hometownController.js';

export const setupHometownRoutes = (datasource:DataSource) => {
    const router = express.Router();
    const hometownController = new HometownController(datasource);

    router.post('/', hometownController.createTown.bind(hometownController));
    router.put('/', hometownController.createTown.bind(hometownController));
    router.get('/', hometownController.getAll.bind(hometownController));
    router.get('/:id', hometownController.getById.bind(hometownController));
    router.delete('/:id', hometownController.deleteById.bind(hometownController));

    return router;
}