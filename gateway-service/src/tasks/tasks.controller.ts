import {
  Body,
  Controller,
  Headers,
  Inject,
  Injectable,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
@Controller('tasks')
export class TasksController {
  constructor(
    @Inject('TASK_SERVICE')
    private readonly taskClient: ClientProxy,
  ) {}

  @Post('demo')
  async publishTask(
    @Headers('authorization') authorization?: string,
    @Body() body?: { title: string; description?: string },
  ) {
    await lastValueFrom(
      this.taskClient.emit('task.created.demo', {
        taskId: crypto.randomUUID(),
        ...body,
      }),
    );
  }
}
