import { validate } from "class-validator";
import { AppError } from "../utils/errors.js";
import { plainToInstance } from "class-transformer";
import { AdmissionValidator } from "../utils/validators.js";
import { logger } from "../utils/logger.js";
import { HttpStatus } from "../utils/constants.js";
import fs from 'fs';
import path from 'path';
import { DataSource, EntityManager, Repository } from "typeorm";
import { Admission } from "../entities/admission.entity.js";
import { Program } from "../entities/program.entity.js";
import { AdmissionRecord, Gender, Status, Track } from "../models/model.js";
import { parseCSV, parseExcel } from "../utils/utils.js";

export class AdmissionService{
    private admissionRepository: Repository<Admission>;
    private programRepository:Repository<Program>
    constructor(dataSource:DataSource) {
        this.admissionRepository = dataSource.getRepository(Admission);
        this.programRepository = dataSource.getRepository(Program);
    }

    async createAdmission(admission: Admission): Promise<Admission | null> {
        try {
            const dto = plainToInstance(AdmissionValidator, admission);
            const errors = await validate(dto);
            if (errors.length > 0) {
                const errorMessages = errors
                .map(err => Object.values(err.constraints || {}).join(', '))
                .join('; ');
                logger.warn('Validation failed for create:Admission', { errors: errorMessages });
                throw new AppError(`${errorMessages}`, HttpStatus.BAD_REQUEST);
            }
            const payload = this.admissionRepository.create(admission);
            return  await this.admissionRepository.save(payload);
        } catch (error) {
            logger.error('Failed to create Admission', { error });
            throw new AppError('Failed to create Admission', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllAdmissions(): Promise<Admission[]> {
        try {
            return await this.admissionRepository.find();
        } catch (error) {
            logger.error('Failed to fetch Admissions', { error });
            throw new AppError('Failed to fetch Admissions', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAdmissionById(id: number): Promise<Admission | null> {
        try {
            const admission = await this.admissionRepository.findOneBy({ id });
        if (!admission) {
            throw new AppError('admission not found', HttpStatus.NOT_FOUND);
        }
            return admission;
        } catch (error) {
            logger.error('Failed to fetch Admission', { error, id });
            throw new AppError('Failed to fetch Admission', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAdmissionByIndexNumber(indexNumber: string): Promise<Admission | null> {
        try {
            const admission = await this.admissionRepository.findOne({
                where: { indexNumber }
            });
        if (!admission) {
            throw new AppError('Admission not found', HttpStatus.NOT_FOUND);
        }
            return admission;
        } catch (error) {
            logger.error('Failed to fetch Admission', { error, indexNumber });
            throw new AppError('Failed to fetch Admission', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async deleteAdmission(id: number) {
        await this.admissionRepository.delete(id);
    }

    async getProgramByName(name: string): Promise<Program | null> {
        try {
            let program = await this.programRepository.findOne({
                where: { name }
            });
            return program;
        } catch (error) {
            throw new AppError('Failed @program', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
 

  public async processAdmissionFile(file: Express.Multer.File): Promise<AdmissionRecord[]> {
    const filePath: string = file.path;
    const fileExtension: string = path.extname(file.originalname).toLowerCase();
    let records: AdmissionRecord[] = [];
    if (fileExtension === '.csv') {
      records = await parseCSV<AdmissionRecord>(filePath,  { Timestamp:'date', LastUpdated: 'date', EntryStatus: 'number'} );
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      records = await parseExcel(filePath);
    } else {
      throw new AppError('Unsupported file format', HttpStatus.BAD_REQUEST);
    }

    const programIdMap: { [programName: string]: number | null | undefined } = {};
    for (const record of records) {
      try {
        if (!programIdMap[record.Program]) {
          let program = await this.programRepository.findOne({ where: { name: record.Program }});
           if(!program){
             program = new Program();
             program.name = record.Program;
             const result = this.programRepository.create(program);
             program = await this.programRepository.save(result);
            }
          programIdMap[record.Program.replace('/\n\g','')] = program ? program.id : null;
        }
      } catch (error) {
        console.error(error);
      }
    }
    
    const toGender = (value: string): Gender => value.toUpperCase() as Gender;
    const toStatus = (value: string): Status => value.toUpperCase() as Status;
    const toTrack = (value: string): Track => value.toUpperCase() as Track;
    debugger
      try {
        await this.admissionRepository.manager.transaction(async (transactionalEntityManager: EntityManager) => {

        const savePromises = records.map(async (record: AdmissionRecord) => {
            const programId = programIdMap[record.Program];
            if (!programId) {
              throw new AppError(`Program Not found for: ${record.Index}`, HttpStatus.BAD_REQUEST);
            }

            const admission = new Admission();
            admission.indexNumber = record.Index?.replace(/\n/g, '');
            admission.name = record.Name.replace(/\n/g, '');
            admission.gender = toGender(record.Gender);
            admission.status = toStatus(record.Status);
            admission.program =  await this.programRepository.findOne({ where: { name: record.Program }}) || undefined;
            admission.track = toTrack(record.Track);
            admission.timestamp = new Date(record.Timestamp)
            admission.lastUpdated = new Date(record.LastUpdated)
            admission.createdBy = record.CreatedBy ? record.CreatedBy?.replace(/\n/g, '') : ''
            admission.updatedBy = record.UpdatedBy ? record.UpdatedBy?.replace(/\n/g, '') : ''
            admission.entryStatus = Number(record.EntryStatus) || 0;
            admission.ip = record.IP;
            admission.id = Number(record.ID);
            admission.key = record.Key;

            return transactionalEntityManager.save(Admission, admission);
        });
        await Promise.all(savePromises);
        });
    } catch (error) {
      console.log(error)
        throw new AppError(`upload error: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    fs.unlinkSync(filePath);
    return records;
  }
}