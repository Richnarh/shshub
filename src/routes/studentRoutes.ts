import express from 'express';
import { StudentController } from '../controller/studentController.js';
import { DataSource } from 'typeorm';

const router = express.Router();
export const setupStudentRoutes = (dataSource: DataSource) => {
    const studentController = new StudentController(dataSource);

    router.post('/', studentController.createStudent.bind(studentController));
    router.put('/', studentController.createStudent.bind(studentController));
    router.get('/', studentController.getAllStudents.bind(studentController));
    router.get('/:id', studentController.getStudentById.bind(studentController));
    router.get('/:indexNumber/index', studentController.getStudentByIndexNumber.bind(studentController));
    router.delete('/:id', studentController.deleteStudent.bind(studentController));

  return router;
}