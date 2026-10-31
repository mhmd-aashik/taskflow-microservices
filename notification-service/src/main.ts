import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { setupRabbitMQTopology } from './rabbitmq/rabbitmq-topology.js';

async function bootstrap() {
  const config = new ConfigService();
  const rabbitmqUrl = config.getOrThrow<string>('RABBITMQ_URL');

  await setupRabbitMQTopology(rabbitmqUrl);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'taskflow.notifications',
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
