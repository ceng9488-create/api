import { IsEmail, IsArray, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'teacherken@gmail.com' })
  @Transform(({ value }) => value?.toLowerCase())
  @IsEmail()
  teacher: string;

  @ApiProperty({ example: ['studentjon@gmail.com', 'studenthon@gmail.com'] })
  @Transform(({ value }) => value?.map((v: string) => v.toLowerCase()))
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  students: string[];
}
