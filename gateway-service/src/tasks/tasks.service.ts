import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthService } from '../auth/auth.service.js';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class TasksService {
  constructor(
    private readonly authService: AuthService,

    @Inject('TASK_SERVICE')
    private readonly taskClient: ClientProxy,
  ) {}

  async createTask(
    authorization: string | undefined,
    body: { title: string; description?: string },
  ) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;

    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    const auth = (await this.authService.validate({
      accessToken: token,
    })) as { valid: boolean; userId?: string };

    if (!auth.valid || !auth.userId) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const task = await firstValueFrom(
      this.taskClient
        .send('task.create', {
          title: body.title,
          description: body.description,
          createdBy: auth.userId,
        })
        .pipe(timeout(5000)),
    );

    return {
      success: true,
      task,
    };
  }
}
