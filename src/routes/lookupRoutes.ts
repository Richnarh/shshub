import express, { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { HttpStatus } from '../utils/constants.js';
import { Roles, UserStatus } from '../models/model.js';

export const setupLookupRoutes = (datasource:DataSource) => {
    const router = express.Router();

    router.get('/roles', (req:Request, res:Response) => {
        res.status(HttpStatus.OK).json({data: Roles})
    });
    router.get('/statuses',  (req:Request, res:Response) => {
        res.status(HttpStatus.OK).json({data: UserStatus})
    });

    return router;
}