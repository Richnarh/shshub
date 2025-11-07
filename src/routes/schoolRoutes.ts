import { DataSource } from "typeorm";
import express from 'express';
import { SchoolController } from "../controller/schoolController.js";
import { upload } from "../config/multerConfig.js";

export const setupSchoolRoutes = (dataSource: DataSource) => {
    const schoolController = new SchoolController(dataSource);
    const router = express.Router();

    router.post('/:districtId', schoolController.createSchoolInHometown.bind(schoolController));
    router.put('/:districtId', schoolController.createSchoolInHometown.bind(schoolController));
    router.get('/:districtId', schoolController.getSchoolsInDistrict.bind(schoolController));
    router.get('/', schoolController.getSchools.bind(schoolController));
    router.delete('/:districtId', schoolController.deleteSchoolInDistrict.bind(schoolController));
    router.get('/:districtId/school/:id', schoolController.getSchoolById.bind(schoolController));
    router.delete('/:districtId/school/:id', schoolController.deleteSchoolById.bind(schoolController));

    router.post('/', upload.single('file'), schoolController.uploadSchools.bind(schoolController));

    return router;
}