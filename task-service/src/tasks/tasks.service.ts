import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DB } from '../database/database.constants.js';
import { tasks } from '../database/schema/task.schema.js';

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
}
