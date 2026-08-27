import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { InviteUserUseCase } from '../application/use-cases/invite-user.use-case';
import { ListUsersUseCase } from '../application/use-cases/list-users.use-case';
import { GetMeUseCase } from '../application/use-cases/get-me.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { DeactivateUserUseCase } from '../application/use-cases/deactivate-user.use-case';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const MANAGEMENT_ROLES = ['PROFISSIONAL_PROPRIETARIO', 'GESTOR_EQUIPE'];

@ApiTags('Equipe')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('users')
export class UsersController {
  constructor(
    private readonly inviteUser: InviteUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getMe: GetMeUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deactivateUser: DeactivateUserUseCase,
  ) {}

  @Get('me')
  async me() {
    return this.getMe.execute();
  }

  @Get()
  async list(@Query() query: PaginationQueryDto) {
    return this.listUsers.execute(query.page, query.limit);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...MANAGEMENT_ROLES)
  async invite(@Body() dto: InviteUserDto) {
    return this.inviteUser.execute(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...MANAGEMENT_ROLES)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.updateUser.execute({ userId: id, ...dto });
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(...MANAGEMENT_ROLES)
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.deactivateUser.execute(id);
  }
}
