import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseModel } from "./basemodel.js";
import { HomeTown } from "./hometown.entity.js";

@Entity('schools')
export class School extends BaseModel{
    @Column({ name: 'name', type: 'varchar', length: 255, unique: true })
    name?: string;

    @ManyToOne(() => HomeTown, (home) => home.schools)
    @JoinColumn({ name: 'hometowns' })
    hometown?: HomeTown;
}