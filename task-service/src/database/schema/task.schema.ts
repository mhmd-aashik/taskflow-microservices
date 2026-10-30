import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),

  title: varchar('title', { length: 255 }).notNull(),

  description: text('description'),

  createdBy: uuid('created_by').notNull(),

  status: varchar('status', { length: 20 }).notNull().default('pending'),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
