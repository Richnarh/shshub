import { DataSource } from "typeorm";
import { AdmissionService } from "../services/admissionService.js";
import { HttpStatus } from "../utils/constants.js";
import { AppError } from "../utils/errors.js";
import { NextFunction, Request, Response } from "express";

export class AdmissionController {
  private admissionService: AdmissionService;

  constructor(dataSource:DataSource) {
    this.admissionService = new AdmissionService(dataSource);
  }

  async createAdmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      const admission = await this.admissionService.createAdmission(req.body);
      res.status(id ? HttpStatus.OK : HttpStatus.CREATED).json(admission);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllAdmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const admissions = await this.admissionService.getAllAdmissions();
      res.status(HttpStatus.OK).json(admissions);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAdmissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const admission = await this.admissionService.getAdmissionById(parseInt(req.params.id));
      res.status(HttpStatus.OK).json(admission);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAdmissionByIndexNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { indexNumber } = req.params;
      if (!indexNumber) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Index number is required' });
      }
      const admission = await this.admissionService.getAdmissionByIndexNumber(indexNumber);
      if (!admission) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Admission not found' });
      }
      res.status(HttpStatus.OK).json(admission);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAdmission(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedAdmission = await this.admissionService.deleteAdmission(parseInt(req.params.id));
      res.status(HttpStatus.OK).json(deletedAdmission);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadAdmissions(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('File is required', HttpStatus.BAD_REQUEST);
      }
      const admissions = await this.admissionService.processAdmissionFile(req.file);
      res.status(HttpStatus.CREATED).json({count:admissions.length, message:'File upload successful'});
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 