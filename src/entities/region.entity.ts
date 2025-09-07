import { Entity, Column, OneToMany } from 'typeorm';
import { BaseModel } from './basemodel.js';

@Entity('regions')
export class Region extends BaseModel {
  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name?: string;
}