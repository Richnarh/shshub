import express from 'express';
import { DataSource } from 'typeorm';
import { ProgramController } from '../controller/programController.js';

export const setupProgramRoutes = (datasource:DataSource) => {
    const router = express.Router();
    const programController = new ProgramController(datasource);

    router.post('/', programController.save.bind(programController));
    router.put('/', programController.save.bind(programController));
    router.get('/', programController.getAllPrograms.bind(programController));
    router.get('/:id', programController.getProgramById.bind(programController));
    router.delete('/:id', programController.deleteProgram.bind(programController));

    return router;
}