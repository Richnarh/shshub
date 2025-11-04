import { Column, Entity } from "typeorm";
import { BaseModel } from "./basemodel.js";
import { Roles, UserStatus } from "../models/model.js";

@Entity("users")
export class User extends BaseModel{
    @Column({ type: 'varchar', name: 'full_name' })
    fullName?:string;

    @Column({ type: 'varchar', name: 'email_address' })
    emailAddress?:string;

    @Column({ type: 'varchar', name: 'password' })
    password?:string;

    @Column({ type: 'enum', name: 'roles', enum: Roles, nullable: true })
    roles?:Roles;

    @Column({ type: 'enum', name: 'status', enum: UserStatus })
    status?:UserStatus;

    @Column({ type: 'date', name: 'last_login' })
    lastLogin?:Date;

    @Column({ type: 'varchar', name: 'profile_picture', nullable: true })
    profilePicture?:string;

    @Column({ type: 'varchar', name: 'phone_number', nullable: true })
    phoneNumber?:string;
}