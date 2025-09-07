import { Request,Response,NextFunction } from "express";
import { HttpStatus } from "../utils/constants.js";
import { DataSource, Repository } from "typeorm";
import { HomeTown } from "../entities/hometown.entity.js";
import { AppError } from "../utils/errors.js";

export class HometownController{
    private hometownRepository: Repository<HomeTown>;
    
    constructor(dataSource:DataSource) {
        this.hometownRepository = dataSource.getRepository(HomeTown);
    }
    
    async createTown(req: Request, res: Response, next: NextFunction) {
        try {
            const town = req.body;
            const payload = this.hometownRepository.create(town);
            const result = await this.hometownRepository.save(payload);
            console.log('result: ', result)
            res.status(req.method === 'POST' ? HttpStatus.OK : HttpStatus.CREATED).json(result);
        } catch (error) {
            console.log(error)
            next(error);
        }
    }
    
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
        const regions = await this.hometownRepository.find();
        res.status(HttpStatus.OK).json(regions);
        } catch (error) {
            next(error);
        }
    }
    
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if(!id){
                throw new AppError('hometownId is required', HttpStatus.BAD_REQUEST);
            }
            const hometown = await this.hometownRepository.findOne({ where: {id: parseInt(id)}});
            if (!hometown) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Hometown not found' });
            }
            res.status(HttpStatus.OK).json(hometown);
        } catch (error) {
            next(error);
        }
    }
    
    async deleteById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if(!id){
                throw new AppError('hometownId is required', HttpStatus.BAD_REQUEST);
            }
            const deletedRegion = await this.hometownRepository.delete(parseInt(id));
            if (!deletedRegion) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Hometown not found' });
            }
            res.status(HttpStatus.OK).json(deletedRegion);
        } catch (error) {
            next(error);
        }
    }

}