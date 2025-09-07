import { NextFunction,Request,Response } from "express";
import { DataSource, EntityManager, Repository } from "typeorm";
import { District } from "../entities/district.entity.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { DefaultService } from "../services/defaultService.js";
import path from "path";
import { DistrictRecord } from "../models/model.js";
import { parseCSV, parseExcel } from "../utils/utils.js";
import { Region } from "../entities/region.entity.js";

export class DistrictController{
    private readonly districtRepository:Repository<District>;
    private readonly regionRepository:Repository<Region>;
    private readonly ds:DefaultService;
    constructor(dataSource:DataSource){
        this.districtRepository = dataSource.getRepository(District);
        this.regionRepository = dataSource.getRepository(Region);
        this.ds = new DefaultService(dataSource);
    }

    createDistrictsInRegion = async(req:Request, res:Response, next:NextFunction) => {
        try {
            const data = req.body;
            const { regionId } = req.params;
            if(!regionId){
                throw new AppError('RegionId is required', HttpStatus.BAD_REQUEST);
            }
            const region = await this.ds.getRegionById(parseInt(regionId));
            data.region = region;
            const payload = this.districtRepository.create(data);
            const result = await this.districtRepository.save(payload);
            res.status(req.method === 'POST' ? HttpStatus.CREATED : HttpStatus.OK).json(result);
        } catch (error) {
            logger.error(error);
            next(next);
        }
    }

    getDistrictsInRegion = async (req: Request, res: Response, next: NextFunction)=>{
        try {
            const { regionId } = req.params;
            if (!regionId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Region ID is required' });
            }
            const districts =  await this.districtRepository.find({
                where: { region: { id: parseInt(regionId) } }
            });
            res.status(HttpStatus.OK).json(districts);
        } catch (error) {
            next(error);
        }
    }
 
    async deleteDistrictById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'District ID is required' });
            }
            const deletedDistrict = await this.districtRepository.delete(id);
            if (!deletedDistrict) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'District not found' });
            }
            res.status(HttpStatus.OK).json(deletedDistrict);
        } catch (error) {
        next(error);
        }
    }   

    async getDistrictsById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, regionId } = req.params;
            if (!id) {
                throw new AppError('District ID is required', HttpStatus.BAD_REQUEST);
            }
            if (!regionId) {
                throw new AppError('RegionId is required', HttpStatus.BAD_REQUEST);
            }
            const district = await this.districtRepository.findOne({ where: { id: parseInt(id) } });
            if (!district) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'District not found' });
            }
            res.status(HttpStatus.OK).json(district);
        } catch (error) {
            next(error);
        }
    }

    async deleteDistrictsInRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { regionId } = req.params;
            if (!regionId) {
                throw new AppError('Region ID is required', HttpStatus.BAD_REQUEST);
            }
            const parsedRegionId = parseInt(regionId, 10);
            if (isNaN(parsedRegionId)) {
                throw new AppError( 'Invalid Region ID', HttpStatus.BAD_REQUEST);
            }
            const deleteResult = await this.districtRepository.delete({
                region: { id: parsedRegionId }
            });
            if (deleteResult.affected === 0) {
                throw new AppError('No districts found for the given region', HttpStatus.BAD_REQUEST);
            }
            res.status(HttpStatus.OK).json({ message: 'Districts deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async uploadDistricts(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw new AppError('File is required', HttpStatus.BAD_REQUEST);
            }
            const file = req.file;
            const filePath: string = file.path;
            const fileExtension: string = path.extname(file.originalname).toLowerCase();
            let records: DistrictRecord[] = [];
            if (fileExtension === '.csv') {
                records = await parseCSV(filePath);
            } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                records = await parseExcel(filePath);
            } else {
                throw new AppError('Unsupported file format', HttpStatus.BAD_REQUEST);
            }
            const regionMap: { [regionName: string]: number | null | undefined } = {};
            for (const record of records) {
                if(!regionMap[record.Region]){
                    let region = await this.regionRepository.findOne({ where: { name: record.Region }});
                    if(!region){
                        region = new Region();
                        region.name = record.Region;
                        const result = this.regionRepository.create(region);
                        region = await this.regionRepository.save(result);
                    }
                    regionMap[record.Region.replace('/\n\g','')] = region ? region.id : null;
                }
            }
            try {
                await this.districtRepository.manager.transaction(async (transaction:EntityManager) => {
                     const saveRecords = records.map(async (record:DistrictRecord) => {
                        const regionId = regionMap[record.Region];
                        if (!regionId) {
                            throw new AppError(`Region Not found for: ${record.Region}`, HttpStatus.BAD_REQUEST);
                        }
                        const district = new District();
                        district.name = record.District;
                        district.region = await this.regionRepository.findOne({ where: { name: record.Region }}) || undefined; 
                        return transaction.save(District, district);
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
        }
    }
}