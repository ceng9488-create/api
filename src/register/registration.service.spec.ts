import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PrismaService } from 'src/prisma.service';

const mockPrisma = {
  teacher: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
  student: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  registration: {
    upsert: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};
mockPrisma.$transaction.mockImplementation(
  (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma),
);

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should upsert teacher and all students', async () => {
      mockPrisma.teacher.upsert.mockResolvedValue({
        id: 1,
        email: 'teacher@gmail.com',
      });
      mockPrisma.student.upsert.mockResolvedValue({});

      await service.register({
        teacher: 'teacher@gmail.com',
        students: ['student1@gmail.com', 'student2@gmail.com'],
      });

      expect(mockPrisma.teacher.upsert).toHaveBeenCalledTimes(1);
      expect(mockPrisma.student.upsert).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException when teacher is missing', async () => {
      await expect(
        service.register({ teacher: '', students: ['s@gmail.com'] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when students array is empty', async () => {
      await expect(
        service.register({ teacher: 'teacher@gmail.com', students: [] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCommonStudents', () => {
    it('should return students common to all given teachers', async () => {
      mockPrisma.student.findMany.mockResolvedValue([
        { email: 'common@gmail.com' },
      ]);

      const result = await service.getCommonStudents([
        'teacher1@gmail.com',
        'teacher2@gmail.com',
      ]);

      expect(result).toEqual({ students: ['common@gmail.com'] });
      expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ AND: expect.any(Array) }),
        }),
      );
    });

    it('should return empty list when no common students', async () => {
      mockPrisma.student.findMany.mockResolvedValue([]);

      const result = await service.getCommonStudents(['teacher@gmail.com']);

      expect(result).toEqual({ students: [] });
    });

    it('should return empty list when teacher array is empty', async () => {
      const result = await service.getCommonStudents([]);

      expect(result).toEqual({ students: [] });
      expect(mockPrisma.student.findMany).not.toHaveBeenCalled();
    });

    it('should return empty list when teacher email does not exist', async () => {
      mockPrisma.student.findMany.mockResolvedValue([]);

      const result = await service.getCommonStudents(['unknown@gmail.com']);

      expect(result).toEqual({ students: [] });
    });
  });

  describe('suspendStudent', () => {
    it('should suspend an existing student', async () => {
      mockPrisma.student.findUnique.mockResolvedValue({
        id: 1,
        email: 'student@gmail.com',
        suspended: false,
      });
      mockPrisma.student.update.mockResolvedValue({});

      await service.suspendStudent('student@gmail.com');

      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { email: 'student@gmail.com' },
        data: { suspended: true },
      });
    });

    it('should throw NotFoundException when student does not exist', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.suspendStudent('notfound@gmail.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getNotificationRecipients', () => {
    it('should return registered non-suspended students', async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue({
        id: '1',
        email: 'teacher@gmail.com',
      });
      mockPrisma.student.findMany.mockResolvedValue([
        { id: 's1', email: 'student1@gmail.com' },
        { id: 's2', email: 'student2@gmail.com' },
      ]);
      mockPrisma.notification.create.mockResolvedValue({});

      const result = await service.getNotificationRecipients({
        teacher: 'teacher@gmail.com',
        notification: 'Hello students',
      });

      expect(result).toEqual({
        recipients: ['student1@gmail.com', 'student2@gmail.com'],
      });
    });

    it('should include @mentioned students in recipients', async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue({
        id: '1',
        email: 'teacher@gmail.com',
      });
      mockPrisma.student.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 's1', email: 'mentioned@gmail.com' }]);
      mockPrisma.notification.create.mockResolvedValue({});

      const result = await service.getNotificationRecipients({
        teacher: 'teacher@gmail.com',
        notification: 'Hey @mentioned@gmail.com please attend',
      });

      expect(result).toEqual({ recipients: ['mentioned@gmail.com'] });
      expect(mockPrisma.student.findMany).toHaveBeenCalledTimes(2);
      expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            suspended: false,
            email: { in: ['mentioned@gmail.com'] },
          }),
        }),
      );
    });

    it('should throw NotFoundException when teacher does not exist', async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      await expect(
        service.getNotificationRecipients({
          teacher: 'nobody@gmail.com',
          notification: 'Hello',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
