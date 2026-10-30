import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DB } from '../database/database.constants.js';
import { tasks } from '../database/schema/task.schema.js';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export type CreateTaskPayload = {
  title: string;
  description?: string;
  createdBy: string;
};

@Injectable()
export class TasksService {
  constructor(
    @Inject(DB)
    private readonly db: PostgresJsDatabase,

    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  async create(data: CreateTaskPayload) {
    const [task] = await this.db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description,
        createdBy: data.createdBy,
      })
      .returning();

    if (!task) {
      throw new Error('Failed to create task');
    }

    await firstValueFrom(
      this.notificationClient.emit('task.created', {
        id: task.id,
        title: task.title,
        description: task.description,
        createdBy: task.createdBy,
      }),
    );

    return task;
  }

  async findById(id: string, userId: string) {
    const [task] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.createdBy, userId)))
      .limit(1);

    return task ?? null;
  }

  async findAllByUser(userId: string) {
    return this.db
      .select()
      .from(tasks)
      .where(eq(tasks.createdBy, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async updateStatus(
    id: string,
    userId: string,
    status: 'pending' | 'in_progress' | 'completed',
  ) {
    const [task] = await this.db
      .update(tasks)
      .set({ status })
      .where(and(eq(tasks.id, id), eq(tasks.createdBy, userId)))
      .returning();

    return task ?? null;
  }

  async delete(id: string, userId: string) {
    const [task] = await this.db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.createdBy, userId)))
      .returning();

    return task ?? null;
  }
}
