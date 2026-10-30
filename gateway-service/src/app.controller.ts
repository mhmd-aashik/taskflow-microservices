import {
  Controller,
  Post,
  Headers,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom, timeout } from 'rxjs';
import { AppService } from './app.service.js';

@Controller('tasks')
export class AppController {
  constructor(
    private readonly appService: AppService,

    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  @Post('demo')
  async publishTask(@Headers('authorization') authorization?: string) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const result = await firstValueFrom(
      this.authClient
        .send<{ valid: boolean; userId?: string }, { accessToken: string }>(
          'auth.validate',
          { accessToken: token },
        )
        .pipe(timeout(5000)),
    );

    if (!result.valid || !result.userId) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await lastValueFrom(this.appService.publishTask());

    return {
      message: 'Task event published to RabbitMQ',
      createdBy: result.userId,
    };
  }
}
