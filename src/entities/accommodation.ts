import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { School } from "./school.entity.js";
import { BaseModel } from "./basemodel.js";

@Entity('accommodation')
export class Accommodation extends BaseModel{

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name?:string;

    @Column({ name: 'number_of_space', type: 'bigint'})
    numberOfSpace?:number;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'schoolId' })
    school?: School;
}