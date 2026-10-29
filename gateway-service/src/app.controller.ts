import { Controller, Post } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AppService } from './app.service.js';

@Controller('tasks')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('demo')
  async publishTask() {
    await lastValueFrom(this.appService.publishTask());

    return {
      message: 'Task event published to RabbitMQ',
    };
  }
}
