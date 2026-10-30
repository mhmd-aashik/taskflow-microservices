import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

export const DB = 'DB';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DB,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const url = configService.getOrThrow<string>('DATABASE_URL');

        const client = postgres(url, {
          max: 5,
        });

        await client`SELECT 1`;

        console.log('PostgreSQL connected successfully');

        return drizzle(client);
      },
    },
  ],
  exports: [DB],
})
export class DatabaseModule {}
