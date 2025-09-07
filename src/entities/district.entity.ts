import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Region } from './region.entity.js';
import { BaseModel } from './basemodel.js';

@Entity('districts')
export class District extends BaseModel {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name?: string;

  @ManyToOne(() => Region)
  @JoinColumn({ name: 'regionId' })
  region?: Region;
}