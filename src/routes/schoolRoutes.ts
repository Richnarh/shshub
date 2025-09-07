import { DataSource } from "typeorm";
import express from 'express';
import { SchoolController } from "../controller/schoolController.js";
import multer from "multer";

export const setupSchoolRoutes = (dataSource: DataSource) => {
    const schoolController = new SchoolController(dataSource);
    const router = express.Router();
    const upload = multer({ dest: 'uploads/' });
    router.post('/:hometownId', schoolController.createSchoolInHometown.bind(schoolController));
    router.put('/:hometownId', schoolController.createSchoolInHometown.bind(schoolController));
    router.get('/:hometownId', schoolController.getSchoolInHometown.bind(schoolController));
    router.delete('/:hometownId', schoolController.deleteSchoolInHometown.bind(schoolController));
    router.get('/:hometownId/school/:id', schoolController.getSchoolById.bind(schoolController));
    router.delete('/:hometownId/school/:id', schoolController.deleteSchoolById.bind(schoolController));

    router.post('/upload', upload.single('file'), schoolController.uploadSchools.bind(schoolController));

    return router;
}