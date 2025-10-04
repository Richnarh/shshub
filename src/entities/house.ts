import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseModel } from "./basemodel.js";
import { School } from "./school.entity.js";

@Entity('house')
export class House extends BaseModel{
    @Column({ name: 'house_name', type: 'varchar', length: 100 })
    houseName?:string;

    @Column({ name: 'number_of_space', type: 'bigint'})
    numberOfSpace?:number;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'schoolId' })
    school?: School;
}