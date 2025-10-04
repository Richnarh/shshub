import { DataSource, Repository } from "typeorm";
import { Accommodation } from "../entities/accommodation.js";
import { NextFunction,Response,Request } from "express";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { School } from "../entities/school.entity.js";

export class AccommodationController{
    private readonly accommodationRepository:Repository<Accommodation>;
    private readonly schoolRepository:Repository<School>;
    constructor(dataSource:DataSource){
        this.accommodationRepository = dataSource.getRepository(Accommodation);
        this.schoolRepository = dataSource.getRepository(School);
    }

    async save(req:Request, res:Response, next:NextFunction){
        try {
            const { name, numberOfSpace, schooldId, id } = req.body;
            if(!name){
                throw new AppError('name is required', HttpStatus.BAD_REQUEST);
            }
            if(!schooldId){
                throw new AppError('SchoolId is required', HttpStatus.BAD_REQUEST);
            }
            const school = await this.schoolRepository.findOne({where: { id: parseInt(schooldId) }});
            if(school == null){
                throw new AppError('schoolId does not exist', HttpStatus.BAD_REQUEST);
            }
            const check = await this.accommodationRepository.findOneBy({ name });
            if(check != null && id == null){
                res.status(HttpStatus.BAD_REQUEST).json({message:`Name '${name}' already exist`});
            }else{
                const payload = {
                    name: name,
                    numberOfSpace: numberOfSpace,
                    school: school
                } as Accommodation;
                if(id) payload.id = id;
                const data = this.accommodationRepository.create(payload);
                const result = await this.accommodationRepository.save(data);
                res.status(req.method == 'POST' ? HttpStatus.CREATED : HttpStatus.OK).json(result);
            }
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllAccommodations(req: Request, res: Response, next: NextFunction) {
    try {
      const accommodations = await this.accommodationRepository.find();
      res.status(HttpStatus.OK).json(accommodations);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

    async getAccommodationById(req: Request, res: Response, next: NextFunction) {
        try {
            const accommodation = await this.accommodationRepository.findOneBy({id: parseInt(req.params.id)});
            res.status(HttpStatus.OK).json(accommodation);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteAccommodation(req: Request, res: Response, next: NextFunction) {
        try {
        const accommodation = await this.accommodationRepository.delete(parseInt(req.params.id));
        res.status(HttpStatus.OK).json(accommodation);
        } catch (error) {
        next(error);
        throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}