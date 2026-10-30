import { Post } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AppService } from './app.service.js';

export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('')
  async publishTask() {
    await lastValueFrom(this.appService.publishTask());

    return {
      message: 'Task event published to RabbitMQ',
    };
  }
}
