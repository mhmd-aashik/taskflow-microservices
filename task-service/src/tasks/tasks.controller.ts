import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { TasksService } from './tasks.service.js';
import type { CreateTaskPayload } from './tasks.service.js';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern('task.create')
  async create(@Payload() data: CreateTaskPayload, @Ctx() context: RmqContext) {
    const task = await this.tasksService.create(data);

    context.getChannelRef().ack(context.getMessage());

    return task;
  }
}
