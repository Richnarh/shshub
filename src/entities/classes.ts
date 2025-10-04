import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Program } from "./program.entity.js";
import { BaseModel } from "./basemodel.js";

@Entity('classes')
export class Classes extends BaseModel{

    @Column({ name: 'class_name', type: 'varchar', length: 100 })
    className?:string;

    @Column({ name: 'number_of_space', type: 'bigint'})
    numberOfSpace?:number;

    @ManyToOne(() => Program)
    @JoinColumn({ name: 'programId' })
    program?: Program;
}