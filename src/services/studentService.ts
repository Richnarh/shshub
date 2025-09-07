import { validate } from "class-validator";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { logger } from "../utils/logger.js";
import { plainToInstance } from "class-transformer";
import { StudentValidator } from "../utils/validators.js";
import { Student } from "../entities/student.entity.js";
import { DataSource, Repository } from "typeorm";

export class StudentService{
    private readonly studentRepository:Repository<Student>;
    constructor(dataSource:DataSource) {
        this.studentRepository = dataSource.getRepository(Student);
    }

    async createStudent(data: Student): Promise<Student | null> {
        try {
             const dto = plainToInstance(StudentValidator, data);
            const errors = await validate(dto);
            if (errors.length > 0) {
                const errorMessages = errors
                .map(err => Object.values(err.constraints || {}).join(', '))
                .join('; ');
                logger.warn('Validation failed for create:student', { errors: errorMessages });
                throw new AppError(`${errorMessages}`, HttpStatus.BAD_REQUEST);
            }
            const payload = this.studentRepository.create(data);
            return this.studentRepository.save(payload);
        } catch (error) {
        logger.error('Failed to create student', { error });
        throw new AppError('Failed to create student', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllStudents(){
        try {
            return await this.studentRepository.find();
        } catch (error) {
        throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getStudentById(id: number): Promise<Student | null> {
        try {
            const student = await this.studentRepository.findOneBy({ id });
        if (!student) {
            throw new AppError('Student not found', HttpStatus.NOT_FOUND);
        }
            return student;
        } catch (error) {
            logger.error('Failed to fetch student', { error, id });
            throw new AppError('Failed to fetch student', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getStudentByIndexNumber(indexNumber: string): Promise<Student | null> {
        try {
            const student = await this.studentRepository.findOne({
                where: { indexNumber }
            });
        if (!student) {
            throw new AppError('Student not found', HttpStatus.NOT_FOUND);
        }
            return student;
        } catch (error) {
            logger.error('Failed to fetch student', { error, indexNumber });
            throw new AppError('Failed to fetch student', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteStudent(id: number){
        return await this.studentRepository.delete(id);
    }
}