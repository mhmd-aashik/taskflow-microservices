import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import nodemailer from 'nodemailer';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  private readonly transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
  });

  async sendTaskCreatedEmail(task: {
    id: string;
    title: string;
    description: string | null;
    createdBy: string;
  }) {
    const user = await firstValueFrom(
      this.authClient
        .send<{
          id: string;
          name: string;
          email: string;
        } | null>('auth.findById', {
          userId: task.createdBy,
        })
        .pipe(timeout(5000)),
    );

    if (!user) {
      throw new Error(`User not found: ${task.createdBy}`);
    }

    await this.transporter.sendMail({
      from: 'TaskFlow <notifications@taskflow.local>',
      to: user.email,
      subject: `Task created: ${task.title}`,
      text: `Your task "${task.title}" was created successfully.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
          <h1>TaskFlow</h1>
          <h2>Your task has been created!</h2>
          <p>Your new task was successfully saved.</p>
          <div style="background:#f3f4f6;padding:20px;border-radius:8px">
            <p><strong>Task:</strong> ${task.title}</p>
            <p><strong>Description:</strong> ${task.description ?? 'None'}</p>
            <p><strong>Status:</strong> Pending</p>
            <p><strong>Task ID:</strong> ${task.id}</p>
          </div>
          <p>Thank you for using TaskFlow. ${user.name}</p>
        </div>
      `,
    });
  }
}
