
import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  it('should create a task and publish an event', async () => {
    const task = {
      id: 'task-123',
      title: 'Learn Vitest',
      description: 'Unit testing',
      createdBy: 'user-123',
    };

    // Mock Drizzle database
    const returning = vi.fn().mockResolvedValue([task]);
    const values = vi.fn().mockReturnValue({ returning });
    const insert = vi.fn().mockReturnValue({ values });

    const mockDb = { insert };

    // Mock RabbitMQ client
    const emit = vi.fn().mockReturnValue(of(undefined));
    const mockClient = { emit };

    const service = new TasksService(
      mockDb as unknown as ConstructorParameters<typeof TasksService>[0],
      mockClient as unknown as ConstructorParameters<typeof TasksService>[1],
    );

    const result = await service.create({
      title: 'Learn Vitest',
      description: 'Unit testing',
      createdBy: 'user-123',
    });

    expect(result).toEqual(task);
    expect(insert).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith({
      title: 'Learn Vitest',
      description: 'Unit testing',
      createdBy: 'user-123',
    });
    expect(emit).toHaveBeenCalledWith('task.created', task);
  });
});
