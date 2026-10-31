import amqp from 'amqplib';

export async function setupRabbitMQTopology(url: string) {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  try {
    // 1. Create Dead Letter Exchange
    await channel.assertExchange('taskflow.notifications.dlx', 'direct', {
      durable: true,
    });

    // 2. Create Dead Letter Queue
    await channel.assertQueue('taskflow.notifications.dlq', {
      durable: true,
    });

    // 3. Bind DLQ to DLX
    await channel.bindQueue(
      'taskflow.notifications.dlq',
      'taskflow.notifications.dlx',
      'failed',
    );

    // 4. Create main notification queue
    await channel.assertQueue('taskflow.notifications', {
      durable: true,
      deadLetterExchange: 'taskflow.notifications.dlx',
      deadLetterRoutingKey: 'failed',
    });

    console.log('RabbitMQ topology initialized');
  } finally {
    await channel.close();
    await connection.close();
  }
}
