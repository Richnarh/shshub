import express from 'express';
import { AdmissionController } from '../controller/admissionController.js';
import multer from 'multer';
import { DataSource } from 'typeorm';

const router = express.Router();
export const setupAdmissionRoutes = (dataSource: DataSource) => {
    const admissionController = new AdmissionController(dataSource);

    const upload = multer({ dest: 'uploads/' });

    router.post('/', admissionController.createAdmission.bind(admissionController));
    router.put('/', admissionController.createAdmission.bind(admissionController));
    router.get('/', admissionController.getAllAdmissions.bind(admissionController));
    router.get('/:id', admissionController.getAdmissionById.bind(admissionController));
    router.get('/:indexNumber/index', admissionController.getAdmissionByIndexNumber.bind(admissionController));
    router.delete('/:id', admissionController.deleteAdmission.bind(admissionController));

    router.post('/upload', upload.single('file'), admissionController.uploadAdmissions.bind(admissionController));

  return router;
}