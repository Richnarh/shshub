import { Entity, Column } from 'typeorm';
import { BaseModel } from './basemodel.js';
import { Relationship,Gender,SecondGuardian } from '../models/model.js';

@Entity('guardians')
export class Guardian extends BaseModel {
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName?: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName?: string;

  @Column({ type: 'enum', enum: Gender })
  gender?: Gender;

  @Column({ type: 'enum', enum: Relationship })
  relationship?: Relationship;

  @Column({ type: 'varchar', length: 100 })
  occupation?: string;

  @Column({ type: 'varchar', length: 100 })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ type: 'enum', enum: SecondGuardian, nullable: true })
  secondGuardian?: SecondGuardian;
}