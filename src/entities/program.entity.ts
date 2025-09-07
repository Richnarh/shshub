import { Entity, Column, OneToMany } from 'typeorm';
import { Student } from './student.entity.js';
import { BaseModel } from './basemodel.js';
import { Admission } from './admission.entity.js';

@Entity('programs')
export class Program extends BaseModel{
  @Column({ type: 'varchar', length: 255 })
  name?: string;

  @OneToMany(() => Student, (student) => student.program)
  students?: Student[];

  @OneToMany(() => Admission, (admission) => admission.program)
  admissions?: Admission[];
}