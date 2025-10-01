import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Role } from '@repo/db'; // Import the Role enum from shared db package
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

// Define a type that matches the shape returned by our userSelect
type UserResponse = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

// Protect all routes in this controller. A user must be logged in to access them.
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * A special route to get the profile of the currently logged-in user.
   * This is a very common and recommended best practice.
   */
  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload): Promise<UserResponse> {
    // The CurrentUser decorator extracts the user from the JWT payload
    return this.usersService.findOne(user.sub);
  }

  /**
   * Get all users. (ADMIN only)
   * This demonstrates a basic authorization check.
   */
  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<UserResponse[]> {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }
    return this.usersService.findAll();
  }

  /**
   * Get a specific user by ID. (ADMIN only)
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponse> {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }
    return this.usersService.findOne(id);
  }

  /**
   * Update a user's profile.
   * Users can only update their own profile, unless they are an ADMIN.
   */
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponse> {
    // Authorization check: Allow if the user is an ADMIN or if they are updating their own profile.
    if (user.role !== Role.ADMIN && user.sub !== id) {
      throw new ForbiddenException('You can only update your own profile.');
    }
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Delete a user. (ADMIN only)
   * This is a destructive action and should be heavily protected.
   */
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponse> {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }
    return this.usersService.remove(id);
  }
}
