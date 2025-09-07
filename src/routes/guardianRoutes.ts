import express from 'express';
import { GuardianController } from '../controller/guardianController.js';
import { DataSource } from 'typeorm';

const router = express.Router();

export const setupGuardianRoutes = (dataSource:DataSource) => {
    const guardianController = new GuardianController(dataSource);

    router.post('/', guardianController.createGuardian.bind(guardianController));
    router.put('/', guardianController.createGuardian.bind(guardianController));
    router.get('/', guardianController.getAllGuardians.bind(guardianController));
    router.get('/:id', guardianController.getGuardianById.bind(guardianController));
    router.delete('/:id', guardianController.deleteGuardian.bind(guardianController));
    return router;
}