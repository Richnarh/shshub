import { DataSource } from "typeorm";
import express from 'express';
import { DistrictController } from "../controller/districtController.js";
import { upload } from "../config/multerConfig.js";


export const setupDistrictRoutes = (dataSource:DataSource) => {
    const router = express.Router();
    const districtController = new DistrictController(dataSource);
    router.post('/:regionId', districtController.createDistrictsInRegion.bind(districtController));
    router.put('/:regionId', districtController.createDistrictsInRegion.bind(districtController));
    router.get('/:regionId', districtController.getDistrictsInRegion.bind(districtController));
    router.get('/', districtController.getDistrictsCount.bind(districtController));
    router.delete('/:regionId', districtController.deleteDistrictsInRegion.bind(districtController));
    router.get('/:regionId/districts/:id', districtController.getDistrictsById.bind(districtController));
    router.delete('/:regionId/districts/:id', districtController.deleteDistrictById.bind(districtController));

    router.post('/', upload.single('file'), districtController.uploadDistricts.bind(districtController));

    return router;
}