import { DataSource, Repository } from "typeorm";
import { NextFunction,Response,Request } from "express";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { Program } from "../entities/program.entity.js";
import { Classes } from "../entities/classes.js";

export class ClassController{
    private readonly classRepository:Repository<Classes>;
    private readonly programRepository:Repository<Program>;
    constructor(dataSource:DataSource){
        this.classRepository = dataSource.getRepository(Classes);
        this.programRepository = dataSource.getRepository(Program);
    }

    async save(req:Request, res:Response, next:NextFunction){
        try {
            const { className, programId, numberOfSpace, id } = req.body;
            if(!className){
                throw new AppError('className is required', HttpStatus.BAD_REQUEST);
            }
            if(!programId){
                throw new AppError('programId is required', HttpStatus.BAD_REQUEST);
            }
            const program = await this.programRepository.findOne({where: { id: parseInt(programId) }});
            if(program == null){
                throw new AppError('programId does not exist', HttpStatus.BAD_REQUEST);
            }
            const check = await this.classRepository.findOneBy({ className });
            if(check != null && id == null){
                res.status(HttpStatus.BAD_REQUEST).json({message:`Class '${className}' already exist`});
            }else{
                const payload = {
                    className: className,
                    numberOfSpace:numberOfSpace,
                    program: program
                } as Classes;
                if(id) payload.id = id;
                const data = this.classRepository.create(payload);
                const result = await this.classRepository.save(data);
                console.log(result)
                res.status(req.method == 'POST' ? HttpStatus.CREATED : HttpStatus.OK).json(result);
            }
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllClass(req: Request, res: Response, next: NextFunction) {
    try {
      const [classes, count] = await this.classRepository.findAndCount();
      res.status(HttpStatus.OK).json({count, data:classes});
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

    async getclassById(req: Request, res: Response, next: NextFunction) {
        try {
            const classes = await this.classRepository.findOneBy({id: parseInt(req.params.id)});
            res.status(HttpStatus.OK).json(classes);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteclass(req: Request, res: Response, next: NextFunction) {
        try {
        const classes = await this.classRepository.delete(parseInt(req.params.id));
        res.status(HttpStatus.OK).json(classes);
        } catch (error) {
        next(error);
        throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}