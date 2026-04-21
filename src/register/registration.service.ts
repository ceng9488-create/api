import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './register.dto';
import { PrismaService } from 'src/prisma.service';
import { RetrieveNotificationsDto } from './retrieve-notification.dto';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto): Promise<void> {
    const { teacher, students } = dto;

    if (!teacher || !students?.length) {
      throw new BadRequestException('Teacher and students are required');
    }

    await this.prisma.$transaction(async (tx) => {
      const teacherRecord = await tx.teacher.upsert({
        where: { email: teacher },
        update: {},
        create: { email: teacher },
      });

      for (const studentEmail of students) {
        const studentRecord = await tx.student.upsert({
          where: { email: studentEmail },
          update: {},
          create: { email: studentEmail },
        });

        await tx.registration.upsert({
          where: {
            teacherId_studentId: {
              teacherId: teacherRecord.id,
              studentId: studentRecord.id,
            },
          },
          update: {},
          create: {
            teacherId: teacherRecord.id,
            studentId: studentRecord.id,
          },
        });
      }
    });
  }

  async getCommonStudents(
    teacherEmails: string[],
  ): Promise<{ students: string[] }> {
    if (!teacherEmails.length) {
      return { students: [] };
    }

    const students = await this.prisma.student.findMany({
      where: {
        AND: teacherEmails.map((email) => ({
          registrations: {
            some: { teacher: { email } },
          },
        })),
      },
      select: { email: true },
    });

    return {
      students: students.map((s) => s.email),
    };
  }
  async suspendStudent(studentEmail: string): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { email: studentEmail },
    });

    if (!student) {
      throw new NotFoundException(`Student ${studentEmail} not found`);
    }

    await this.prisma.student.update({
      where: { email: studentEmail },
      data: { suspended: true },
    });
  }

  async getNotificationRecipients(
    dto: RetrieveNotificationsDto,
  ): Promise<{ recipients: string[] }> {
    const { teacher, notification } = dto;

    const teacherRecord = await this.prisma.teacher.findUnique({
      where: { email: teacher },
    });

    if (!teacherRecord) {
      throw new NotFoundException(`Teacher ${teacher} not found`);
    }

    const mentionedEmails =
      notification.match(
        /(?<=@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      ) ?? [];

    const registeredStudents = await this.prisma.student.findMany({
      where: {
        suspended: false,
        registrations: { some: { teacher: { email: teacher } } },
      },
      select: { id: true, email: true },
    });

    const mentionedStudents =
      mentionedEmails.length > 0
        ? await this.prisma.student.findMany({
            where: { suspended: false, email: { in: mentionedEmails } },
            select: { id: true, email: true },
          })
        : [];

    const allRecipients = [
      ...new Map(
        [...registeredStudents, ...mentionedStudents].map((s) => [s.email, s]),
      ).values(),
    ];

    await this.prisma.notification.create({
      data: {
        teacherId: teacherRecord.id,
        message: notification,
        recipients: {
          create: allRecipients.map((s) => ({ studentId: s.id })),
        },
      },
    });

    return { recipients: allRecipients.map((s) => s.email) };
  }
}
