import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseModel } from "./basemodel.js";
import { District } from "./district.entity.js";
import { Gender, Residency } from "../models/model.js";

@Entity('schools')
export class School extends BaseModel{
    @Column({ name: 'name', type: 'varchar', length: 255 })
    name?: string;

    @Column({ name: 'location', type: 'varchar', length: 255 })
    location?: string;

    @Column({ name: 'email_address', type: 'varchar', length: 255 })
    emailAddress?: string;

    @Column({ name: 'gender', type: 'enum', enum: Gender })
    gender?: Gender;

    @Column({ name: 'residency', type: 'enum', enum: Residency })
    residency?: Residency;

    @ManyToOne(() => District)
    @JoinColumn({ name: 'districtId' })
    district?: District;
}