import { NextFunction, Request, Response } from "express";
import { DataSource, Repository } from "typeorm";
import { User } from "../entities/User.js";
import { HttpStatus } from "../utils/constants.js";
import { AppError } from "../utils/errors.js";

export class UserController{
    private readonly userRepository: Repository<User>;

    constructor(dataSource:DataSource){
        this.userRepository = dataSource.getRepository(User);
    }

    async save(req:Request, res:Response, next:NextFunction){
        try {
            const user = req.body;
            let { id } = req.params;
            
            if(!user.fullName){
                throw new AppError('Name is required', HttpStatus.BAD_REQUEST);
            }
            if(!user.roles){
                throw new AppError('Role is required', HttpStatus.BAD_REQUEST);
            }
            
            const check = await this.userRepository.findOne({
                 where: { 
                    fullName: user.fullName, 
                    phoneNumber: user.phoneNumber 
            }});
            if(check != null && id == null){
                res.status(HttpStatus.BAD_REQUEST).json({message:`User already exist`});
            }else{
                if(id) user.id = parseInt(id);
                const data = this.userRepository.create(user);
                const result = await this.userRepository.save(data);
                res.status(req.method == 'POST' ? HttpStatus.CREATED : HttpStatus.OK).json(result);
            }
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const [users, count] = await this.userRepository.findAndCount();
      res.status(HttpStatus.OK).json({count, data:users});
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userRepository.findOneBy({id: parseInt(req.params.id)});
            res.status(HttpStatus.OK).json(users);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userRepository.delete(parseInt(req.params.id));
            res.status(HttpStatus.OK).json(user);
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}