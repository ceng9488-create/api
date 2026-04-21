import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RegistrationService } from './registration.service';
import { RegisterDto } from './register.dto';
import { SuspendDto } from './suspend.dto';
import { RetrieveNotificationsDto } from './retrieve-notification.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('register')
  @HttpCode(204)
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto): Promise<void> {
    await this.registrationService.register(dto);
  }

  @Get('commonstudents')
  async getCommonStudents(@Query('teacher') teacher?: string | string[]) {
    const teachers = Array.isArray(teacher)
      ? teacher
      : teacher
        ? [teacher]
        : [];
    return this.registrationService.getCommonStudents(teachers);
  }
  @Post('suspend')
  @HttpCode(204)
  @ApiBody({
    type: SuspendDto,
    examples: { example: { value: { student: 'studentmary@gmail.com' } } },
  })
  async suspend(@Body() dto: SuspendDto) {
    await this.registrationService.suspendStudent(dto.student);
  }
  @Post('retrievefornotifications')
  @ApiResponse({
    status: 200,
    description: 'List of students who can receive the notification',
    schema: {
      example: {
        recipients: [
          'studentbob@gmail.com',
          'studentagnes@gmail.com',
          'studentmiche@gmail.com',
        ],
      },
    },
  })
  @ApiBody({
    type: RetrieveNotificationsDto,
    examples: {
      example: {
        value: {
          teacher: 'teacherken@gmail.com',
          notification:
            'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
        },
      },
    },
  })
  async retrieveForNotifications(@Body() dto: RetrieveNotificationsDto) {
    return this.registrationService.getNotificationRecipients(dto);
  }
}
