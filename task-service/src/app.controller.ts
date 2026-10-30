import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class AppController {
  @EventPattern<string>('task.created.demo')
  handleTaskCreated(
    @Payload() data: { taskId: string; title: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    channel.ack(message);

    return { message: 'Task received' };
  }
}
