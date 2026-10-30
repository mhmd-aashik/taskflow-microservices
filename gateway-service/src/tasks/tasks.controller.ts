import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('demo')
  createTask(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { title: string; description?: string },
  ) {
    return this.tasksService.createTask(authorization, body);
  }

  @Get(':id')
  findById(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
  ) {
    return this.tasksService.findById(authorization, id);
  }
}
