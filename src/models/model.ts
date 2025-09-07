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
  Hometown:string;
  School:string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
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

export enum Track {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
}