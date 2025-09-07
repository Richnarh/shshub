import express from 'express';
import { DataSource } from 'typeorm';
import { RegionController } from '../controller/regionController.js';

export const setupRegionRoutes = (datasource:DataSource) => {
    const router = express.Router();
    const regionController = new RegionController(datasource);

    router.post('/', regionController.createRegion.bind(regionController));
    router.put('/', regionController.createRegion.bind(regionController));
    router.get('/', regionController.getAllRegions.bind(regionController));
    router.get('/:id', regionController.getRegionById.bind(regionController));
    router.delete('/:id', regionController.deleteRegion.bind(regionController));

    return router;
}