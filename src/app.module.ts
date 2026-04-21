import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma.service';
import { RegistrationModule } from './register/registration.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    RegistrationModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    // limits each IP to 20 requests per 60 seconds
  ],
  controllers: [],
  providers: [PrismaService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
  exports: [PrismaService],
})
export class AppModule {}
