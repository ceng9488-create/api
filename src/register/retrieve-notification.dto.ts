import { IsEmail, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RetrieveNotificationsDto {
  @Transform(({ value }) => value?.toLowerCase())
  @IsEmail()
  teacher: string;

  @IsString()
  @MaxLength(1000)
  notification: string;
}
