import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUseCase } from '@/application/usecases/auth/login-usecase';
import { GetAuthenticatedUserUseCase } from '@/application/usecases/auth/get-authenticated-user-usecase';
import { LoginDto } from '@/application/dtos/login-dto';
import { CurrentUser } from '@/infraestructure/decorators/current-user-decorator';
import { IsPublic } from '@/infraestructure/decorators/is-public-decorator';
import { Roles } from '@/infraestructure/decorators/roles-decorator';

@ApiTags('Autenticação')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly getAuthenticatedUserUseCase: GetAuthenticatedUserUseCase,
  ) {}

  @IsPublic()
  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário autenticado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return await this.loginUseCase.execute(loginDto);
  }

  @ApiBearerAuth()
  @Get('me')
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Obter informações do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Informações do usuário obtidas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getAuthenticatedUser(@CurrentUser() currentUser: Auth.CurrentUser) {
    return await this.getAuthenticatedUserUseCase.execute(currentUser);
  }
}
