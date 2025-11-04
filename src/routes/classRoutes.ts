import express from 'express';
import { DataSource } from 'typeorm';
import { ClassController } from '../controller/classController.js';

export const setupClassesRoutes = (datasource:DataSource) => {
    const router = express.Router();
    const classController = new ClassController(datasource);

    router.post('/', classController.save.bind(classController));
    router.put('/', classController.save.bind(classController));
    router.get('/', classController.getAllClass.bind(classController));
    router.get('/:id', classController.getclassById.bind(classController));
    router.delete('/:id', classController.deleteclass.bind(classController));

    return router;
}