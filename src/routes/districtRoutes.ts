import { DataSource } from "typeorm";
import express from 'express';
import { DistrictController } from "../controller/districtController.js";
import multer from "multer";


export const setupDistrictRoutes = (dataSource:DataSource) => {
    const router = express.Router();
    const districtController = new DistrictController(dataSource);
    const upload = multer({ dest: 'uploads/' });
    router.post('/:regionId/districts', districtController.createDistrictsInRegion.bind(districtController));
    router.put('/:regionId/districts', districtController.createDistrictsInRegion.bind(districtController));
    router.get('/:regionId/districts', districtController.getDistrictsInRegion.bind(districtController));
    router.delete('/:regionId/districts', districtController.deleteDistrictsInRegion.bind(districtController));
    router.get('/:regionId/districts/:id', districtController.getDistrictsById.bind(districtController));
    router.delete('/:regionId/districts/:id', districtController.deleteDistrictById.bind(districtController));

    router.post('/upload', upload.single('file'), districtController.uploadDistricts.bind(districtController));

    return router;
}