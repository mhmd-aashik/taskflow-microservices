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

  @MessagePattern('task.findById')
  async findById(
    @Payload() data: { id: string; userId: string },
    @Ctx() context: RmqContext,
  ) {
    const task = await this.tasksService.findById(data.id, data.userId);

    context.getChannelRef().ack(context.getMessage());

    return task;
  }

  @MessagePattern('task.findAll')
  async findAll(
    @Payload() data: { userId: string },
    @Ctx() context: RmqContext,
  ) {
    const result = await this.tasksService.findAllByUser(data.userId);

    context.getChannelRef().ack(context.getMessage());

    return result;
  }

  @MessagePattern('task.updateStatus')
  async updateStatus(
    @Payload()
    data: {
      id: string;
      userId: string;
      status: 'pending' | 'in_progress' | 'completed';
    },
    @Ctx() context: RmqContext,
  ) {
    const task = await this.tasksService.updateStatus(
      data.id,
      data.userId,
      data.status,
    );

    context.getChannelRef().ack(context.getMessage());

    return task;
  }
}
