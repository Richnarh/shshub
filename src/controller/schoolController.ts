import { DataSource, EntityManager, Repository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import path from "path";
import * as fs from 'fs';

import { School } from "../entities/school.entity.js";
import { DefaultService } from "../services/defaultService.js";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { logger } from "../utils/logger.js";
import { Gender, Residency, SchoolRecord } from "../models/model.js";
import { parseCSV, parseExcel } from "../utils/utils.js";
import { HomeTown } from "../entities/hometown.entity.js";
import { District } from "../entities/district.entity.js";
import { UploadRequest } from "../config/multerConfig.js";

export class SchoolController{
    private schoolRepository:Repository<School>;
    private districtRepository:Repository<District>;
    private readonly ds:DefaultService;
    constructor(dataSource:DataSource){
        this.schoolRepository = dataSource.getRepository(School);
        this.districtRepository = dataSource.getRepository(District);
        this.ds = new DefaultService(dataSource);
    }

    createSchoolInHometown = async(req:Request, res:Response, next:NextFunction) => {
        try {
            const data = req.body;
            const { districtId } = req.params;
            if(!districtId){
                throw new AppError('districtId is required', HttpStatus.BAD_REQUEST);
            }
            const district = await this.ds.getDistrictById(parseInt(districtId));
            data.district = district;
            const payload = this.schoolRepository.create(data);
            const result = await this.schoolRepository.save(payload);
            res.status(req.method === 'POST' ? HttpStatus.CREATED : HttpStatus.OK).json(result);
        } catch (error) {
            logger.error(error);
            next(next);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    getSchoolsInDistrict = async (req: Request, res: Response, next: NextFunction)=>{
        try {
            const { districtId } = req.params;
            if (!districtId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'DistrictId is required' });
            }
            const school =  await this.schoolRepository.find({
                where: { district: { id: parseInt(districtId) } }
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
            const { id, districtId } = req.params;
            if (!id) {
                throw new AppError('SchoolId is required', HttpStatus.BAD_REQUEST);
            }
            if (!districtId) {
                throw new AppError('DistrictId is required', HttpStatus.BAD_REQUEST);
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

    async deleteSchoolInDistrict(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { districtId } = req.params;
            if (!districtId) {
                throw new AppError('Region ID is required', HttpStatus.BAD_REQUEST);
            }
            const parsedDistrictId = parseInt(districtId, 10);
            if (isNaN(parsedDistrictId)) {
                throw new AppError( 'Invalid District ID', HttpStatus.BAD_REQUEST);
            }
            const deleteResult = await this.schoolRepository.delete({
                district: { id: parsedDistrictId }
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

    async uploadSchools(req: UploadRequest, res: Response, next: NextFunction) {
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
            const districtMap: { [districtName: string]: number | null | undefined } = {};
            for (const record of records) {
                try {
                    if(!districtMap[record.District]){
                    let district = await this.districtRepository.findOne({ where: { name: record.District }});
                    if(!district){
                        district = new District();
                        district.name = record.District;
                        const result = this.districtRepository.create(district);
                        district = await this.districtRepository.save(result);
                    }
                    districtMap[record.District] = district ? district.id : null;
                }
                } catch (error) {
                    console.error(error);
                }
            }
            const toGender = (value: string): Gender => value.toUpperCase() as Gender;
            const toResidency = (value: string): Residency => value.replace('/','_').toUpperCase() as Residency;
            await this.schoolRepository.manager.transaction(async (transaction:EntityManager) => {
                for (const record of records) {
                    const districtId = districtMap[record.District];
                    if (!districtId) {
                        throw new AppError(`District Not found for: ${record.District}`, HttpStatus.BAD_REQUEST);
                    }
                    const school = new School();
                    school.name = record.School;
                    school.district = await this.districtRepository.findOne({ where: { name: record.District }}) || undefined; 
                    school.residency = toResidency(record.Residency);
                    school.gender = toGender(record.Gender);
                    school.location = record.Location;
                    school.emailAddress = record.EmailAddress
                    await transaction.save(School, school);
                }
                    });
            res.status(HttpStatus.CREATED).json({count:records.length, message:'File upload successful'});
        } catch (error) {
            logger.error(error);
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }finally{
            const uploadDir = req.uploadDir;
            if (uploadDir) {
                try {
                    await fs.promises.rm(uploadDir, { recursive: true, force: true });
                } catch (cleanupErr) {
                    console.error("Error deleting upload folder:", cleanupErr);
                    next(cleanupErr);
                }
            }
        }
    }
}