import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DATABASE_CONNECTION } from '@/database/database.module';
import * as schema from '@/database/schema';
import { ApiResponseHelper } from '@/common/helpers/api-response.helper';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, username, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.db.query.users.findFirst({
      where: or(eq(schema.users.username, username), eq(schema.users.email, email)),
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        name,
        username,
        email,
        password: hashedPassword,
      })
      .returning();

    // Generate JWT token
    const token = this.generateToken(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return ApiResponseHelper.success(
      {
        user: userWithoutPassword,
        token,
      },
      'Registration successful',
    );
  }

  async login(loginDto: LoginDto) {
    const { usernameOrEmail, password } = loginDto;

    // Find user by username or email
    const user = await this.db.query.users.findFirst({
      where: or(
        eq(schema.users.username, usernameOrEmail),
        eq(schema.users.email, usernameOrEmail),
      ),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return ApiResponseHelper.success(
      {
        user: userWithoutPassword,
        token,
      },
      'Login successful',
    );
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
