import { DataSource, Repository } from "typeorm";
import { NextFunction,Response,Request } from "express";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { Program } from "../entities/program.entity.js";

export class ProgramController{
    private readonly programRepository:Repository<Program>;
    constructor(dataSource:DataSource){
        this.programRepository = dataSource.getRepository(Program);
    }

    async save(req:Request, res:Response, next:NextFunction){
        try {
            const { name,  id } = req.body;
            if(!name){
                throw new AppError('name is required', HttpStatus.BAD_REQUEST);
            }
            const check = await this.programRepository.findOneBy({ name });
            if(check != null && id == null){
                res.status(HttpStatus.BAD_REQUEST).json({message:`'${name}' already exist`});
            }else{
                const payload = { name } as Program;
                if(id) payload.id = id;
                const data = this.programRepository.create(payload);
                const result = await this.programRepository.save(data);
                res.status(req.method == 'POST' ? HttpStatus.CREATED : HttpStatus.OK).json(result);
            }
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllPrograms(req: Request, res: Response, next: NextFunction) {
        try {
            const programs = await this.programRepository.find();
            res.status(HttpStatus.OK).json(programs);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

    async getProgramById(req: Request, res: Response, next: NextFunction) {
        try {
            const program = await this.programRepository.findOneBy({id: parseInt(req.params.id)});
            res.status(HttpStatus.OK).json(program);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteProgram(req: Request, res: Response, next: NextFunction) {
        try {
            const program = await this.programRepository.delete(parseInt(req.params.id));
            res.status(HttpStatus.OK).json(program);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}