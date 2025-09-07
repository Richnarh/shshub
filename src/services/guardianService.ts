import { plainToInstance } from "class-transformer";
import { GuardianValidator } from "../utils/validators.js";
import { validate } from "class-validator";
import { AppError } from "../utils/errors.js";
import { HttpStatus } from "../utils/constants.js";
import { logger } from "../utils/logger.js";
import { DataSource, Repository } from "typeorm";
import { Guardian } from "../entities/guardian.entity.js";

export class GuardianService{
    private guadianRepository: Repository<Guardian>;

    constructor(dataSource:DataSource,) {
        this.guadianRepository = dataSource.getRepository(Guardian);
    }

    async createGuardian(guardian: Guardian): Promise<Guardian | null> {
        try {
            const dto = plainToInstance(GuardianValidator, guardian);
            const errors = await validate(dto);
            if (errors.length > 0) {
                const errorMessages = errors
                .map(err => Object.values(err.constraints || {}).join(', '))
                .join('; ');
                logger.warn('Validation failed for create:Guardian', { errors: errorMessages });
                throw new AppError(`${errorMessages}`, HttpStatus.BAD_REQUEST);
            }
            const payload = this.guadianRepository.create(guardian);
            return this.guadianRepository.save(payload);
        } catch (error) {
            logger.error('Failed to create Admission', { error });
            throw new AppError('Failed to create Admission', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllGuardians(): Promise<Guardian[]> {
        try {
            return await this.guadianRepository.find();
        } catch (error) {
            throw new AppError('Failed to fetch guardians',HttpStatus.NOT_FOUND);
        }
    }

    async getGuardianById(id: number): Promise<Guardian | null> {
        try {
            const guardian = await this.guadianRepository.findOneBy({id});
            if (!guardian) {
                throw new AppError('Guardian not found', HttpStatus.NOT_FOUND);
            }
            return guardian;
        } catch (error) {
            throw new AppError('Failed to fetch guardian', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteGuardian(id: number){
        await this.guadianRepository.delete(id);
    }
}