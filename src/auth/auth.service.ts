import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersEntity } from 'src/users/users.entity';
import { UsersService } from '../users/users.service';
import { compare } from '../utils/crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UsersEntity | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = user;
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verify(token: string) {
    return this.jwtService.verify(token);
  }
}
