import {
  IsArray,
  IsNotEmpty,
  IsNotIn,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MyReadyGRPOSByID {
  @IsString()
  @IsNotEmpty({ message: 'Grpo ID is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Grpo ID is required' })
  id: string;
}
export class MyCompletedGRPOSByID {
  @IsString()
  @IsNotEmpty({ message: 'Grpo ID is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Grpo ID is required' })
  id: string;
}
export class CreateMyGRPOValidatorDTO {
  @IsString({ message: 'Bill Date is required' })
  @IsNotEmpty({ message: 'Bill Date is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Bill Date is required' })
  BILLDATE: string;

  @IsString({ message: 'Bill Number is required' })
  @IsNotEmpty({ message: 'Bill Number is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Bill Number is required' })
  BILLNO: string;

  //   @IsArray()
  //   @ValidateNested({ each: true })
  //   attachments: Array<File>;

  @IsString({ message: 'Items are required' })
  @IsNotEmpty({ message: 'Items are required' })
  @IsNotIn(['undefined', 'null'], { message: 'Items are required' })
  ITEMS: string;

  @IsString({ message: 'Series are required' })
  @IsNotEmpty({ message: 'Series are required' })
  @IsNotIn(['undefined', 'null'], { message: 'Series are required' })
  SERIES: string;

  @IsString({ message: 'Status is required' })
  @IsNotEmpty({ message: 'Status is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Status is required' })
  STATUS: 'ready' | 'completed';

  @IsString({ message: 'Branch is required' })
  @IsNotEmpty({ message: 'Branch is required' })
  @IsNotIn(['undefined', 'null'], { message: 'Branch is required' })
  BPLId: string;
}
