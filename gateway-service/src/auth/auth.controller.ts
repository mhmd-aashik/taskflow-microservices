import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';

import type { RegisterPayload, LoginPayload } from './types.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterPayload) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginPayload) {
    return this.authService.login(body);
  }
}
