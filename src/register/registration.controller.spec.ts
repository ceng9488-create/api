import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

const mockService = {
  register: jest.fn(),
  getCommonStudents: jest.fn(),
  suspendStudent: jest.fn(),
  getNotificationRecipients: jest.fn(),
};

describe('RegistrationController', () => {
  let controller: RegistrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [{ provide: RegistrationService, useValue: mockService }],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call service.register with dto', async () => {
      mockService.register.mockResolvedValue(undefined);

      await controller.register({
        teacher: 'teacher@gmail.com',
        students: ['student@gmail.com'],
      });

      expect(mockService.register).toHaveBeenCalledWith({
        teacher: 'teacher@gmail.com',
        students: ['student@gmail.com'],
      });
    });
  });

  describe('getCommonStudents', () => {
    it('should return common students for a single teacher', async () => {
      mockService.getCommonStudents.mockResolvedValue({
        students: ['student@gmail.com'],
      });

      const result = await controller.getCommonStudents('teacher@gmail.com');

      expect(result).toEqual({ students: ['student@gmail.com'] });
      expect(mockService.getCommonStudents).toHaveBeenCalledWith([
        'teacher@gmail.com',
      ]);
    });

    it('should normalize multiple teachers into an array', async () => {
      mockService.getCommonStudents.mockResolvedValue({ students: [] });

      await controller.getCommonStudents([
        'teacher1@gmail.com',
        'teacher2@gmail.com',
      ]);

      expect(mockService.getCommonStudents).toHaveBeenCalledWith([
        'teacher1@gmail.com',
        'teacher2@gmail.com',
      ]);
    });
  });

  describe('suspend', () => {
    it('should call service.suspendStudent with student email', async () => {
      mockService.suspendStudent.mockResolvedValue(undefined);

      await controller.suspend({ student: 'studentmary@gmail.com' });

      expect(mockService.suspendStudent).toHaveBeenCalledWith(
        'studentmary@gmail.com',
      );
    });
  });

  describe('retrieveForNotifications', () => {
    it('should return notification recipients', async () => {
      mockService.getNotificationRecipients.mockResolvedValue({
        recipients: ['student@gmail.com'],
      });

      const result = await controller.retrieveForNotifications({
        teacher: 'teacher@gmail.com',
        notification: 'Hello',
      });

      expect(result).toEqual({ recipients: ['student@gmail.com'] });
      expect(mockService.getNotificationRecipients).toHaveBeenCalledWith({
        teacher: 'teacher@gmail.com',
        notification: 'Hello',
      });
    });
  });
});
