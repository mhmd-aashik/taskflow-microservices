import { Controller } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { AuthService } from './auth.service.js';
import type {
  RegisterPayload,
  LoginPayload,
  ValidatePayload,
  JwtPayload,
} from './types.js';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: RegisterPayload, @Ctx() context: RmqContext) {
    const result = await this.authService.register(data);

    context.getChannelRef().ack(context.getMessage());

    return result;
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: LoginPayload, @Ctx() context: RmqContext) {
    const result = await this.authService.login(data);

    context.getChannelRef().ack(context.getMessage());

    return result;
  }

  @MessagePattern('auth.validate')
  async validate(@Payload() data: ValidatePayload, @Ctx() context: RmqContext) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        data.accessToken,
      );

      return {
        valid: true,
        userId: payload.sub,
        email: payload.email,
      };
    } catch {
      return {
        valid: false,
        message: 'Invalid or expired token',
      };
    } finally {
      context.getChannelRef().ack(context.getMessage());
    }
  } 
}
