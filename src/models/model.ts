export interface AdmissionRecord {
  Index: string;
  Name: string;
  Gender: string;
  Status: string;
  Program: string;
  Track: string;
  Timestamp: Date;
  LastUpdated: Date;
  CreatedBy: string;
  UpdatedBy: string;
  EntryStatus: number;
  IP: string;
  ID: string;
  Key: string;
}

export interface DistrictRecord{
  Region:string;
  District:string;
}

export interface SchoolRecord{
  District:string;
  School:string;
  Location:string;
  Gender:string;
  Residency:string;
  EmailAddress:string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  MIXED = 'MIXED'
}

export enum Faith {
  CHRISTIANITY = 'CHRISTIANITY',
  ISLAM = 'ISLAM',
  TRADITIONAL = 'TRADITIONAL',
}

export enum HealthCondition {
  YES = 'YES',
  NO = 'NO',
}

export enum Relationship {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  BROTHER = 'BROTHER',
  SISTER = 'SISTER',
  GUARDIAN = 'GUARDIAN',
}

export enum SecondGuardian {
  YES = 'YES',
  NO = 'NO',
}

export enum Status {
  DAY = 'DAY',
  BOARDING = 'BOARDING',
}

export enum Residency{
  DAY = 'DAY',
  BOARDING = 'BOARDING',
  DAY_BOARDING = 'DAY_BOARDING'
}

export enum Track {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
}

export enum Roles{
  SUPER_ADMINISTRATOR = 'SUPER_ADMINISTRATOR',
  ADMINISTRATOR = 'ADMINISTRATOR',
  EDITOR = 'EDITOR',
  VIEWWER = 'VIEWER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

export enum UserStatus{
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum Creator{
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN'
}