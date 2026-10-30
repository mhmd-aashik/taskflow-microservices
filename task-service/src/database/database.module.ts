import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DB } from './database.constants.js';

@Global()
@Module({
  providers: [
    {
      provide: DB,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const url = configService.getOrThrow<string>('DATABASE_URL');

        const client = postgres(url, { max: 5 });

        await client`SELECT 1`;

        console.log('Task Service PostgreSQL connected');

        return drizzle(client);
      },
    },
  ],
  exports: [DB],
})
export class DatabaseModule {}
