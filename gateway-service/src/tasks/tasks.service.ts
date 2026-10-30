import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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

  async findById(authorization: string | undefined, id: string) {
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
        .send<{
          id: string;
          createdBy: string;
          title: string;
          description: string | null;
          status: string;
        } | null>('task.findById', { id, userId: auth.userId })
        .pipe(timeout(5000)),
    );

    if (!task || task.createdBy !== auth.userId) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async findAll(authorization: string | undefined) {
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

    return firstValueFrom(
      this.taskClient
        .send('task.findAll', {
          userId: auth.userId,
        })
        .pipe(timeout(5000)),
    );
  }

  async updateStatus(
    authorization: string | undefined,
    id: string,
    status: string,
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

    const allowedStatuses = ['pending', 'in_progress', 'completed'];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid task status');
    }

    const task = await firstValueFrom(
      this.taskClient
        .send('task.updateStatus', {
          id,
          userId: auth.userId,
          status,
        })
        .pipe(timeout(5000)),
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async delete(authorization: string | undefined, id: string) {
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
        .send('task.delete', {
          id,
          userId: auth.userId,
        })
        .pipe(timeout(5000)),
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }
}
