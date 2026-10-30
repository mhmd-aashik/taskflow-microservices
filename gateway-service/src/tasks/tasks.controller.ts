import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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

  @Get()
  findAll(@Headers('authorization') authorization: string | undefined) {
    return this.tasksService.findAll(authorization);
  }

  @Patch(':id/status')
  updateStatus(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.tasksService.updateStatus(authorization, id, body.status);
  }
}
