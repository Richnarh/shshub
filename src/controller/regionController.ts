import { Request,Response,NextFunction } from "express";
import { RegionService } from "../services/regionService.js";
import { HttpStatus } from "../utils/constants.js";
import { DataSource } from "typeorm";

export class RegionController{
    private regionService: RegionService;
    
    constructor(dataSource:DataSource) {
        this.regionService = new RegionService(dataSource);
    }
    
    async createRegion(req: Request, res: Response, next: NextFunction) {
        try {
            const region = await this.regionService.createRegion(req.body);
            res.status(req.method === 'POST' ? HttpStatus.OK : HttpStatus.CREATED).json(region);
        } catch (error) {
        next(error);
        }
    }
    
    async getAllRegions(req: Request, res: Response, next: NextFunction) {
        try {
        const regions = await this.regionService.getAllRegions();
        res.status(HttpStatus.OK).json(regions);
        } catch (error) {
        next(error);
        }
    }
    
    async getRegionById(req: Request, res: Response, next: NextFunction) {
        try {
            const region = await this.regionService.getRegionById(parseInt(req.params.id));
            if (!region) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Region not found' });
            }
            res.status(HttpStatus.OK).json(region);
        } catch (error) {
        next(error);
        }
    }
    
    async deleteRegion(req: Request, res: Response, next: NextFunction) {
        try {
            const deletedRegion = await this.regionService.deleteRegion(parseInt(req.params.id));
            if (!deletedRegion) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Region not found' });
            }
            res.status(HttpStatus.OK).json(deletedRegion);
        } catch (error) {
            next(error);
        }
    }

}