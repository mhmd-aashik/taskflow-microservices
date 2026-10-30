import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service.js';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern<string>('task.created')
  async handleTaskCreated(
    @Payload()
    data: {
      id: string;
      title: string;
      description: string | null;
      createdBy: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.notificationsService.sendTaskCreatedEmail(data);

      channel.ack(message);
    } catch (error) {
      console.error('Email notification failed:', error);

      channel.nack(message, false, false);
    }
  }
}
