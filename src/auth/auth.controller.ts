import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("Authentication")
@Controller({
  version: '1',
  path: 'auth'
})
export class AuthController {

  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'User registration route for talents' })
  async userRegistration(@Body() registerDto: RegisterDto) {
    const response = await this.authService.register(registerDto);

    return {
      message: 'User registered successfully, verification email sent',
      user: response
    }
  }

  @Post('login')
  @ApiOperation({summary: 'User login route for verified users'})
  async userLogin(@Body() loginDto: LoginDto) {
    const response = await this.authService.login(loginDto)
    return {
      message: 'User logged in successfully',
      ...response
    }
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Email verification route'})
  async verifyEmail(@Query("token") token: string) {
    if (!token) {
      throw new BadRequestException("Token is required");
    }
    return this.authService.verifyEmail(token);
  }

}
