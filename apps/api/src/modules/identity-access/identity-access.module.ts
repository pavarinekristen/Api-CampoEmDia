import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './interface/auth.controller';
import { UsersController } from './interface/users.controller';
import { RegisterTenantUseCase } from './application/use-cases/register-tenant.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { InviteUserUseCase } from './application/use-cases/invite-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { PasswordHasher } from './infrastructure/password-hasher.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    RegisterTenantUseCase,
    LoginUseCase,
    InviteUserUseCase,
    ListUsersUseCase,
    GetMeUseCase,
    UpdateUserUseCase,
    DeactivateUserUseCase,
    JwtStrategy,
    PasswordHasher,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class IdentityAccessModule {}
