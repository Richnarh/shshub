import { Entity, Column } from 'typeorm';
import { BaseModel } from './basemodel.js';

@Entity('programs')
export class Program extends BaseModel{
  @Column({ type: 'varchar', length: 255 })
  name?: string;
}