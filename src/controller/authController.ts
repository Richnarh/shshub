import { NextFunction, Request, Response } from "express";
import { DataSource, Repository } from "typeorm";
import bcrypt from 'bcrypt';

import { User } from "../entities/User.js";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";

export interface LoginRequest {
    emailAddress:string, 
    password:string
}

export class AuthController{
    private readonly authRepository:Repository<User>;
      private SALT_ROUNDS = 10;
    constructor(dataSource:DataSource){
        this.authRepository = dataSource.getRepository(User);
    }

    async doLogin(req:Request, res:Response, next:NextFunction){
        try {
            const loginReq = {} as LoginRequest;
            Object.assign(loginReq, req.body);
            if(!loginReq.emailAddress){
                throw new AppError('EmailAddress is required', HttpStatus.BAD_REQUEST);
            }
            if(!loginReq.password){
                throw new AppError('Password is required', HttpStatus.BAD_REQUEST);
            }
            const user = await this.authRepository.findOne({  where: { emailAddress: loginReq.emailAddress } });
            if (!user) {
                throw new AppError('Invalid credentials', HttpStatus.BAD_REQUEST);
            }
            const isMatch = await bcrypt.compare(loginReq.password, user.password!);
            if (!isMatch) {
                throw new AppError('Invalid username or password', HttpStatus.BAD_REQUEST);
            }
            const { password, ...response } = user;
            res.status(HttpStatus.OK).json({ message: 'Login successful', data: response });
        } catch (error) {
            next(error);
        }
    }

    async signup(req:Request, res:Response, next:NextFunction){
        try {
            const user = {} as User;
            Object.assign(user, req.body);
            let { id } = req.params;
            
            if(!user.fullName){
                throw new AppError('Name is required', HttpStatus.BAD_REQUEST);
            }
            if(!user.roles){
                throw new AppError('Role is required', HttpStatus.BAD_REQUEST);
            }
            
            const check = await this.authRepository.findOne({
                where: { 
                    fullName: user.fullName, 
                    phoneNumber: user.phoneNumber 
                }});
                if(check != null && id == null){
                    res.status(HttpStatus.BAD_REQUEST).json({message:`User already exist`});
                }else{
                    user.password = await bcrypt.hash(user.password!, this.SALT_ROUNDS);
                    if(id) user.id = parseInt(id);
                    const data = this.authRepository.create(user);
                    const result = await this.authRepository.save(data);
                    const { password, ...rest } = result;
                    res.status(req.method == 'POST' ? HttpStatus.CREATED : HttpStatus.OK).json(rest);
            }
        } catch (error) {
            next(error);
            throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}