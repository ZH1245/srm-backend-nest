import { IsIn, IsNotEmpty, IsNotIn, IsNumber, IsString } from 'class-validator';

export class CreateUserValidatorDTO {
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Name is required' })
  NAME: string;

  @IsString({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Email is required' })
  EMAIL: string;

  @IsString({ message: 'Password is required' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Password is required' })
  PASSWORD: string;

  @IsString({ message: 'Role is required' })
  @IsNotEmpty({ message: 'Role is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Role is required' })
  @IsIn(['admin', 'user', 'purchase'], { message: 'Role is required' })
  ROLE: string;

  @IsString({ message: 'Mobile is required' })
  @IsNotEmpty({ message: 'Mobile is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Mobile is required' })
  MOBILE: string;

  @IsString({ message: 'Code is required' })
  @IsNotEmpty({ message: 'Code is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Code is required' })
  CODE: string;
}

export class UpdateUserValidatorDTO {
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Name is required' })
  NAME: string;

  @IsString({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Email is required' })
  EMAIL: string;

  @IsString({ message: 'Password is required' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Password is required' })
  PASSWORD: string;

  @IsString({ message: 'Mobile is required' })
  @IsNotEmpty({ message: 'Mobile is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Mobile is required' })
  MOBILE: string;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'ID is required' },
  )
  @IsNotEmpty({ message: 'Code is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Code is required' })
  ID: string;
}

export class EditUserValidatorDTO {
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Name is required' })
  NAME: string;

  @IsString({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Email is required' })
  EMAIL: string;

  @IsString({ message: 'Password is required' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Password is required' })
  PASSWORD: string;

  @IsString({ message: 'Role is required' })
  @IsNotEmpty({ message: 'Role is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Role is required' })
  @IsIn(['admin', 'user', 'purchase'], { message: 'Role is required' })
  ROLE: string;

  @IsString({ message: 'Mobile is required' })
  @IsNotEmpty({ message: 'Mobile is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Mobile is required' })
  MOBILE: string;

  @IsString({ message: 'Code is required' })
  @IsNotEmpty({ message: 'Code is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Code is required' })
  CODE: string;

  @IsString({ message: 'IsActive is required' })
  @IsNotEmpty({ message: 'IsActive is required' })
  @IsNotIn(['undefined', 'null'], { message: 'IsActive is required' })
  ISACTIVE: '0' | '1';

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'ID is required' },
  )
  @IsNotEmpty({ message: 'ID is required' })
  @IsNotIn(['undefined', 'null'], { message: 'ID is required' })
  ID: string;
}
