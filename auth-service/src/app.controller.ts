import { Controller } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly jwtService: JwtService) {}

  @MessagePattern('auth.login')
  async login(
    @Payload() data: { email: string; password: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    const valid =
      data.email === 'demo@taskflow.dev' && data.password === 'demo123';

    if (!valid) {
      channel.ack(message);

      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    const accessToken = await this.jwtService.signAsync({
      sub: 'user-001',
      email: data.email,
    });

    channel.ack(message);

    return {
      success: true,
      accessToken,
    };
  }
}
