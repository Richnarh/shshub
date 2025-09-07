import { Entity, Column, OneToMany } from 'typeorm';
import { BaseModel } from './basemodel.js';
import { Admission } from './admission.entity.js';
import { Student } from './student.entity.js';

@Entity('programs')
export class Program extends BaseModel{
  @Column({ type: 'varchar', length: 255 })
  name?: string;

  @OneToMany(() => Admission, (admission) => admission.program)
  admissions?: Admission[];
}