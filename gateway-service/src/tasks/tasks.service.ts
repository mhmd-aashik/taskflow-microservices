import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthService } from '../auth/auth.service.js';
import { randomUUID } from 'node:crypto';

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

    const task = {
      taskId: randomUUID(),
      title: body.title,
      description: body.description,
      createdBy: auth.userId,
    };

    await this.taskClient.emit('task.created.demo', task).toPromise();

    return {
      success: true,
      message: 'Task event published',
      task,
    };
  }
}
