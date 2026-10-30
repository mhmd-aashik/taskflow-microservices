import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import type {
  RegisterPayload,
  LoginPayload,
  ValidatePayload,
} from './types.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  register(data: RegisterPayload) {
    return firstValueFrom(
      this.authClient.send('auth.register', data).pipe(timeout(5000)),
    );
  }

  login(data: LoginPayload) {
    return firstValueFrom(
      this.authClient.send('auth.login', data).pipe(timeout(5000)),
    );
  }

  validate(data: ValidatePayload) {
    return firstValueFrom(
      this.authClient.send('auth.validate', data).pipe(timeout(5000)),
    );
  }
}
