import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Gender, Status, Track } from '../models/model.js';
import { Program } from './program.entity.js';
import { BaseModel } from './basemodel.js';

@Entity('admissions')
export class Admission extends BaseModel {
  @Column({ name: 'index_number', type: 'varchar', length: 255 })
  indexNumber?: string;

  @Column({ type: 'varchar', length: 255 })
  name?: string;

  @Column({ type: 'enum', enum: Gender })
  gender?: Gender;

  @Column({ type: 'enum', enum: Status })
  status?: Status;

  @Column({ type: 'enum', enum: Track })
  track?: Track;

  @Column({ name: 'entry_status', type: 'integer' })
  entryStatus?: number;

  @Column({ type: 'timestamp' })
  timestamp?: Date;

  @Column({ type: 'varchar' })
  ip?: string;

  @Column({ type: 'varchar' })
  key?: string;

  @ManyToOne(() => Program)
  @JoinColumn({ name: 'programId' })
  program?: Program;
}