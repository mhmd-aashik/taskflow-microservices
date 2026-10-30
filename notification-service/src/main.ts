import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL!],
        queue: process.env.RABBITMQ_QUEUE!,
        queueOptions: {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': 'taskflow.notifications.dlx',
            'x-dead-letter-routing-key': 'failed',
          },
        },
        noAck: false,
      },
    },
  );

  await app.listen();
}
await bootstrap();
