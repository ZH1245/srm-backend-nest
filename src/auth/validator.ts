import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import SQLRegex from 'src/utils/SQLRegex';
import { validateSQL } from 'src/utils/checkSQL';
export class LoginValidatorDTO {
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  EMAIL: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 20, { message: 'Password must be between 6 to 20 characters' })
  PASSWORD: string;
}

export class GenerateOTPValidatorDTO {
  @IsString({ message: 'Email must be a string' })
  @IsEmail()
  // @Matches(SQLRegex, { message: 'Email must not contain any SQL keyword' })
  @IsNotEmpty({ message: 'Email is required' })
  EMAIL: string;
}
export class VerifyOTPPasswordValidatorDTO {
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 20, { message: 'Password must be between 6 to 20 characters' })
  // @Matches(SQLRegex, { message: 'Password must not contain any SQL keyword' })
  password: string;

  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be 6 characters long' })
  // @Matches(SQLRegex, { message: 'OTP must not contain any SQL keyword' })
  otp: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  // Decorator for regex to not include any sql keyword
  // @Matches(SQLRegex, { message: 'Email must not contain any SQL keyword' })
  email: string;
}
