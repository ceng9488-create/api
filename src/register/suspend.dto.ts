import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class SuspendDto {
  @Transform(({ value }) => value?.toLowerCase())
  @IsEmail()
  student: string;
}
