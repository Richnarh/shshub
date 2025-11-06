import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { logger } from "../utils/logger.js";
import { Region } from "../entities/region.entity.js";
import { DataSource, Repository } from "typeorm";

export class RegionService{
    private regionRepository: Repository<Region>;
    constructor(dataSource:DataSource) {
        this.regionRepository = dataSource.getRepository(Region);
    }

    async createRegion(region: Region): Promise<Region | null> {
        try {
            if (!region.name) {
                throw new AppError('Region name is required', HttpStatus.BAD_REQUEST);
            }
            const payload = this.regionRepository.create(region);
            return await this.regionRepository.save(payload);
        } catch (error) {
            logger.error('Failed to create region', { error });
            throw new AppError('Failed to create region', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllRegions(): Promise<[Region[], count:number]> {
        try {
            return await this.regionRepository.findAndCount();
        } catch (error) {
            logger.error('Failed to fetch regions', { error });
            throw new AppError('Failed to fetch regions', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getRegionById(id: number): Promise<Region | null> {
        try {
            const region = await this.regionRepository.findOneBy({ id });
            if (!region) {
                throw new AppError('Region not found', HttpStatus.NOT_FOUND);
            }
            return region;
        } catch (error) {
            logger.error('Failed to fetch region', { error, id });
            throw new AppError('Failed to fetch region', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async deleteRegion(id: number){
        return await this.regionRepository.delete(id);
    }

}