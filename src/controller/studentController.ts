import { DataSource } from 'typeorm';
import { StudentService } from '../services/studentService.js';
import { NextFunction, Request, Response} from 'express';
import { HttpStatus } from '../utils/constants.js';
import { AppError } from '../utils/errors.js';

export class StudentController {
  private readonly studentService: StudentService;

  constructor(dataSource:DataSource) {
    this.studentService = new StudentService(dataSource);
  }

  async createStudent(req:Request, res:Response, next:NextFunction) {
    try {
        const { id } = req.body;
        const student = await this.studentService.createStudent(req.body);
        res.status(id ? HttpStatus.OK : HttpStatus.CREATED).json(student);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllStudents(req:Request, res:Response, next:NextFunction) {
    try {
      const [students, count] = await this.studentService.getAllStudents();
      res.status(HttpStatus.OK).json({count, data:students});
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getStudentById(req:Request, res:Response, next:NextFunction) {
    try {
      const student = await this.studentService.getStudentById(parseInt(req.params.id));
      res.status(HttpStatus.OK).json(student);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getStudentByIndexNumber(req:Request, res:Response, next:NextFunction) {
    try {
      const { indexNumber } = req.params;
      if (!indexNumber) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Index number is required' });
      }
      const student = await this.studentService.getStudentByIndexNumber(indexNumber);
      if (!student) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Student not found' });
      }
      res.status(HttpStatus.OK).json(student);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteStudent(req:Request, res:Response, next:NextFunction) {
    try {
      const deletedStudent = await this.studentService.deleteStudent(parseInt(req.params.id));
      res.status(HttpStatus.OK).json(deletedStudent);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}