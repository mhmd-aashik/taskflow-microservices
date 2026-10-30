import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  @EventPattern<string>('task.created')
  handleTaskCreated(
    @Payload()
    data: {
      id: string;
      title: string;
      description: string | null;
      createdBy: string;
    },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Task created: ${data.title}`);
    this.logger.log(`Task ID: ${data.id}`);
    this.logger.log(`Created by: ${data.createdBy}`);

    context.getChannelRef().ack(context.getMessage());
  }
}
