import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DB } from '../database/database.module.js';
import { users } from '../database/schema/user.schema.js';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, LoginPayload, RegisterPayload } from './types.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB)
    private readonly db: PostgresJsDatabase,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterPayload) {
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        message: 'Email already registered',
      };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const [user] = await this.db
      .insert(users)
      .values({
        name: data.name,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      success: true,
      user,
      accessToken,
    };
  }

  async login(data: LoginPayload) {
    const email = data.email.trim().toLowerCase();

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }

  async validate(accessToken: string) {
    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(accessToken);

      return {
        valid: true,
        userId: payload.sub,
        email: payload.email,
      };
    } catch {
      return {
        valid: false,
        message: 'Invalid or expired token',
      };
    }
  }
}
