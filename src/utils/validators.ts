import { IsNotEmpty, Matches, registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { DataSource, Repository } from 'typeorm';
import { Admission } from '../entities/admission.entity.js';

@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  private static admissionRepository:Repository<Admission>;

  public static initialize(dataSource: DataSource) {
      this.admissionRepository = dataSource.getRepository(Admission);
    }

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
        if (!value) return true;
        if (!IsUniqueConstraint.admissionRepository) {
            throw new Error('admissionRepository not initialized for IsUniqueConstraint');
        }
        const [field] = args.constraints as [string];
        const user = await IsUniqueConstraint.admissionRepository.findOneBy({ [field]: value });
        return !user;
    }

    defaultMessage(args: ValidationArguments): string {
        const [, displayName] = args.constraints as [string, string];
        return `${displayName} ${args.value} already exists`;
    }
}

 const createUniqueDecorator = (field: string, displayName: string) => {
  return function (validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName,
        options: validationOptions,
        constraints: [field, displayName],
        validator: IsUniqueConstraint,
      });
    };
  };
}

export const IsIndexNumber = createUniqueDecorator('indexNumber', 'Index Number');
export class AdmissionValidator {
  @IsNotEmpty({ message: 'Index number is required' })
  @IsIndexNumber()
  indexNumber?: string;
}

export class LoginUserValidator {
  @IsNotEmpty({ message: 'Email/Phone is required' })
  emailPhone?: string;

  @IsNotEmpty({ message: 'Password is required' })
  password?: string;
}

export class StudentValidator {
  @IsNotEmpty({ message: 'FullName name is required' })
  fullName?: string;

  @IsNotEmpty({ message: 'IndexNumber is required' })
  indexNumber?: string;

  @IsNotEmpty({ message: 'EnrollmentCode is required' })
  enrollmentCode?: string;

  @IsNotEmpty({ message: 'PlaceOfBirth is required' })
  placeOfBirth?: string;

  @IsNotEmpty({ message: 'Date of birth is required' })
  dateOfBirth?: Date;

  @IsNotEmpty({ message: 'Region is required' })
  region?: string;

  @IsNotEmpty({ message: 'District is required' })
  district?: string;

  @IsNotEmpty({ message: 'HomeTown is required' })
  homeTown?: string;

  @IsNotEmpty({ message: 'JhsCompleted is required' })
  jhsCompleted?: string;

  @IsNotEmpty({ message: 'HealthConditions is required' })
  healthConditions?: string;
}

export class GuardianValidator {
  @IsNotEmpty({ message: 'FirstName is required' })
  firstName?: string;

  @IsNotEmpty({ message: 'LastName is required' })
  lastName?: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(/^(?:(?:\+233)|0)(?:[2357]\d{8}|[23][2-9]\d{7})$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsNotEmpty({ message: 'Relationship is required' })
  relationship?: string;

  @IsNotEmpty({ message: 'Occupation is required' })
  occupation?: string;
}