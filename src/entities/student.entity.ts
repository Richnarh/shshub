import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Gender, Faith, HealthCondition } from '../models/model.js';
import { BaseModel } from './basemodel.js';
import { Program } from './program.entity.js';

@Entity('students')
export class Student extends BaseModel {
  @Column({ name: 'index_number', unique: true, type: 'varchar', length: 100 })
  indexNumber?: string;

  @Column({ name: 'enrollment_code', unique: true, type: 'varchar', length: 100 })
  enrollmentCode?: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName?: string;

  @Column({ type: 'enum', enum: Gender })
  gender?: Gender;

  @Column({ name: 'date_of_birth', type: 'timestamp' })
  dateOfBirth?: Date;

  @Column({ name: 'place_of_birth', type: 'varchar', length: 100 })
  placeOfBirth?: string;

  @Column({ name: 'region', type: 'varchar', length: 100 })
  region?: string;

  @Column({ name: 'district', type: 'varchar', length: 100 })
  district?: string;

  @Column({ name: 'home_town', type: 'varchar', length: 100 })
  homeTown?: string;

  @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ name: 'faith_religion', type: 'enum', enum: Faith })
  faithReligion?: Faith;

  // @Column({ name: 'program_id' })
  // programId?: number;

  @Column({ name: 'track', type: 'varchar', length: 100 })
  track?: string;

  @Column({ name: 'status', type: 'varchar', length: 100 })
  status?: string;

  @Column({ name: 'date_of_enrolment', type: 'timestamp' })
  dateOfEnrolment?: Date;

  @Column({ name: 'contact', type: 'varchar', length: 100, nullable: true })
  contact?: string;

  @Column({ name: 'ghana_card_no', type: 'varchar', length: 100, nullable: true })
  ghanaCardNo?: string;

  @Column({ name: 'nhis', type: 'varchar', length: 100, nullable: true })
  nhis?: string;

  @Column({ name: 'jhs_completed', type: 'varchar', length: 100 })
  jhsCompleted?: string;

  @Column({ name: 'areas_of_sports', type: 'varchar', length: 255, nullable: true })
  areasOfSports?: string;

  @Column({ name: 'health_conditions', type: 'enum', enum: HealthCondition, nullable: true })
  healthConditions?: HealthCondition;

  @ManyToOne(() => Program)
  @JoinColumn({ name: 'programId' })
  program?: Program;
}