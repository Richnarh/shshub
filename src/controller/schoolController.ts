import { DataSource, EntityManager, Repository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import path from "path";

import { School } from "../entities/school.entity.js";
import { DefaultService } from "../services/defaultService.js";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { logger } from "../utils/logger.js";
import { SchoolRecord } from "../models/model.js";
import { parseCSV, parseExcel } from "../utils/utils.js";
import { HomeTown } from "../entities/hometown.entity.js";

export class SchoolController{
    private schoolRepository:Repository<School>;
    private hometownRepository:Repository<HomeTown>;
    private readonly ds:DefaultService;
    constructor(dataSource:DataSource){
        this.schoolRepository = dataSource.getRepository(School);
        this.hometownRepository = dataSource.getRepository(HomeTown);
        this.ds = new DefaultService(dataSource);
    }

    createSchoolInHometown = async(req:Request, res:Response, next:NextFunction) => {
        try {
            const data = req.body;
            const { hometownId } = req.params;
            if(!hometownId){
                throw new AppError('HometownId is required', HttpStatus.BAD_REQUEST);
            }
            const hometown = await this.ds.getHometownById(parseInt(hometownId));
            data.hometown = hometown;
            const payload = this.schoolRepository.create(data);
            const result = await this.schoolRepository.save(payload);
            res.status(req.method === 'POST' ? HttpStatus.CREATED : HttpStatus.OK).json(result);
        } catch (error) {
            logger.error(error);
            next(next);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    getSchoolInHometown = async (req: Request, res: Response, next: NextFunction)=>{
        try {
            const { hometownId } = req.params;
            if (!hometownId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'HometownId is required' });
            }
            const school =  await this.schoolRepository.find({
                where: { hometown: { id: parseInt(hometownId) } }
            });
            res.status(HttpStatus.OK).json(school);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
 
    async deleteSchoolById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'SchooldId is required' });
            }
            const school = await this.schoolRepository.delete(id);
            if (!school) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'School not found' });
            }
            res.status(HttpStatus.OK).json(school);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }   

    async getSchoolById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, hometownId } = req.params;
            if (!id) {
                throw new AppError('SchoolId is required', HttpStatus.BAD_REQUEST);
            }
            if (!hometownId) {
                throw new AppError('HometownId is required', HttpStatus.BAD_REQUEST);
            }
            const school = await this.schoolRepository.findOne({ where: { id: parseInt(id) } });
            if (!school) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'School not found' });
            }
            res.status(HttpStatus.OK).json(school);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteSchoolInHometown(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { hometownId } = req.params;
            if (!hometownId) {
                throw new AppError('Region ID is required', HttpStatus.BAD_REQUEST);
            }
            const parsedhometownId = parseInt(hometownId, 10);
            if (isNaN(parsedhometownId)) {
                throw new AppError( 'Invalid Region ID', HttpStatus.BAD_REQUEST);
            }
            const deleteResult = await this.schoolRepository.delete({
                hometown: { id: parsedhometownId }
            });
            if (deleteResult.affected === 0) {
                throw new AppError('No schools found for the given region', HttpStatus.BAD_REQUEST);
            }
            res.status(HttpStatus.OK).json({ message: 'schools deleted successfully' });
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadSchools(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw new AppError('File is required', HttpStatus.BAD_REQUEST);
            }
            const file = req.file;
            const filePath: string = file.path;
            const fileExtension: string = path.extname(file.originalname).toLowerCase();
            let records: SchoolRecord[] = [];
            if (fileExtension === '.csv') {
                records = await parseCSV(filePath);
            } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                records = await parseExcel(filePath);
            } else {
                throw new AppError('Unsupported file format', HttpStatus.BAD_REQUEST);
            }
            const hometownMap: { [hometownName: string]: number | null | undefined } = {};
            for (const record of records) {
                if(!hometownMap[record.Hometown]){
                    let hometown = await this.hometownRepository.findOne({ where: { name: record.Hometown }});
                    if(!hometown){
                        hometown = new HomeTown();
                        hometown.name = record.Hometown;
                        const result = this.hometownRepository.create(hometown);
                        hometown = await this.hometownRepository.save(result);
                    }
                    hometownMap[record.Hometown.replace('/\n\g','')] = hometown ? hometown.id : null;
                }
            }
            try {
                await this.schoolRepository.manager.transaction(async (transaction:EntityManager) => {
                     const saveRecords = records.map(async (record:SchoolRecord) => {
                        const hometownId = hometownMap[record.Hometown];
                        if (!hometownId) {
                            throw new AppError(`hometown Not found for: ${record.Hometown}`, HttpStatus.BAD_REQUEST);
                        }
                        const school = new School();
                        school.name = record.School;
                        school.hometown = await this.hometownRepository.findOne({ where: { name: record.Hometown }}) || undefined; 
                        return transaction.save(School, school);
                    });
                    await Promise.all(saveRecords);
                });
            } catch (error) {
                logger.error(error);
                throw new AppError(`upload error: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            res.status(HttpStatus.CREATED).json({count:records.length, message:'File upload successful'});
        } catch (error) {
            logger.error(error);
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}