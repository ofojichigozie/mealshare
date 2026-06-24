import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DATABASE_CONNECTION } from '@/database/database.module';
import * as schema from '@/database/schema';
import { ApiResponseHelper } from '@/common/helpers/api-response.helper';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async findById(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const [updatedUser] = await this.db
      .update(schema.users)
      .set(updateUserDto)
      .where(eq(schema.users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userWithoutPassword } = updatedUser;

    return ApiResponseHelper.success(userWithoutPassword, 'Profile updated successfully');
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.db
      .update(schema.users)
      .set({
        password: hashedPassword,
      })
      .where(eq(schema.users.id, userId));

    return ApiResponseHelper.success(null, 'Password changed successfully');
  }
}
