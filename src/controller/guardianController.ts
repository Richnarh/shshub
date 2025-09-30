import { DataSource } from "typeorm";
import { GuardianService } from "../services/guardianService.js";
import { HttpStatus } from "../utils/constants.js";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

export class GuardianController {
  private guardianService: GuardianService;

  constructor(dataSource:DataSource) {
    this.guardianService = new GuardianService(dataSource);
  }

  async createGuardian(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      const guardian = await this.guardianService.createGuardian(req.body);
      res.status(id ? HttpStatus.OK : HttpStatus.CREATED).json(guardian);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllGuardians(req: Request, res: Response, next: NextFunction) {
    try {
      const guardians = await this.guardianService.getAllGuardians();
      res.status(HttpStatus.OK).json(guardians);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getGuardianById(req: Request, res: Response, next: NextFunction) {
    try {
      const guardian = await this.guardianService.getGuardianById(parseInt(req.params.id));
      res.status(HttpStatus.OK).json(guardian);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteGuardian(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedGuardian = await this.guardianService.deleteGuardian(parseInt(req.params.id));
      res.status(HttpStatus.OK).json(deletedGuardian);
    } catch (error) {
      next(error);
      throw new AppError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}