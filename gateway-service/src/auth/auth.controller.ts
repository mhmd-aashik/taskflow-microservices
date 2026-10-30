import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return firstValueFrom(
      this.authClient.send('auth.login', body).pipe(timeout(5000)),
    );
  }
}
