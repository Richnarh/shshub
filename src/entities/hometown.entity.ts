import { Column, Entity, OneToMany } from "typeorm";
import { BaseModel } from "./basemodel.js";
import { School } from "./school.entity.js";

@Entity('hometowns')
export class HomeTown extends BaseModel{
  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name?: string;

  @OneToMany(() => School, (sch) => sch.hometown)
  schools?: School[];
}