import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern('auth.login')
  login(
    @Payload() data: { email: string; password: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    console.log('AUTH SERVICE RECEIVED:', data);

    const valid =
      data.email === 'demo@taskflow.dev' && data.password === 'demo123';

    channel.ack(message);

    return valid
      ? { success: true, userId: 'user-001' }
      : { success: false, message: 'Invalid credentials' };
  }
}
