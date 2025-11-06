import { DataSource, Repository } from "typeorm";
import { NextFunction,Response,Request } from "express";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { House } from "../entities/house.js";
import { School } from "../entities/school.entity.js";

export class HouseController{
    private readonly houseRepository:Repository<House>;
    private readonly schoolRepository:Repository<School>;
    constructor(dataSource:DataSource){
        this.houseRepository = dataSource.getRepository(House);
        this.schoolRepository = dataSource.getRepository(School);
    }

    async save(req:Request, res:Response, next:NextFunction){
        try {
            const { houseName, numberOfSpace, schoolId, id } = req.body;
            if(!houseName){
                throw new AppError('HouseName is required', HttpStatus.BAD_REQUEST);
            }
            if(!schoolId){
                throw new AppError('schoolId is required', HttpStatus.BAD_REQUEST);
            }
            const school = await this.schoolRepository.findOne({where: { id: parseInt(schoolId) }});
            if(school == null){
                throw new AppError('schoolId does not exist', HttpStatus.BAD_REQUEST);
            }
            const check = await this.houseRepository.findOneBy({ houseName });
            if(check != null && id == null){
                res.status(HttpStatus.BAD_REQUEST).json({message:`Class '${houseName}' already exist`});
            }else{
                const payload = {
                    houseName: houseName,
                    numberOfSpace:numberOfSpace,
                    school: school
                } as House;
                if(id) payload.id = id;
                const data = this.houseRepository.create(payload);
                const result = await this.houseRepository.save(data);
                res.status(req.method == 'POST' ? HttpStatus.CREATED : HttpStatus.OK).json(result);
            }
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllHouses(req: Request, res: Response, next: NextFunction) {
    try {
      const [house, count] = await this.houseRepository.findAndCount();
      res.status(HttpStatus.OK).json({count, data:house});
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

    async getHouseById(req: Request, res: Response, next: NextFunction) {
        try {
            const Housees = await this.houseRepository.findOneBy({id: parseInt(req.params.id)});
            res.status(HttpStatus.OK).json(Housees);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteHouse(req: Request, res: Response, next: NextFunction) {
        try {
            const Housees = await this.houseRepository.delete(parseInt(req.params.id));
            res.status(HttpStatus.OK).json(Housees);
        } catch (error) {
        next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}