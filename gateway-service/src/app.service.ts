import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('TASK_SERVICE')
    private readonly taskClient: ClientProxy,
  ) {}

  publishTask() {
    return this.taskClient.emit('task.created.demo', {
      taskId: 'TASK-002',
      title: 'Message from Gateway',
    });
  }
}
