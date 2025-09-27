import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UsePipes,
  ForbiddenException,
  ParseUUIDPipe, // A good pipe for validating CUIDs/UUIDs
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Role } from '@repo/db'; // Import the Role enum from shared db package

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
  getProfile(@Request() req: any): Promise<any> {
    // req.user is populated by the JwtStrategy with the token payload.
    // 'sub' (subject) should contain the user ID.
    return this.usersService.findOne(req.user.sub);
  }

  /**
   * Get all users. (ADMIN only)
   * This demonstrates a basic authorization check.
   */
  @Get()
  findAll(@Request() req: any): Promise<any> {
    if (req.user.role !== Role.ADMIN) {
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
  findOne(@Param('id') id: string, @Request() req: any): Promise<any> {
    if (req.user.role !== Role.ADMIN) {
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
    @Request() req: any,
  ): Promise<any> {
    // Authorization check: Allow if the user is an ADMIN or if they are updating their own profile.
    if (req.user.role !== Role.ADMIN && req.user.sub !== id) {
      throw new ForbiddenException('You can only update your own profile.');
    }
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Delete a user. (ADMIN only)
   * This is a destructive action and should be heavily protected.
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any): Promise<any> {
    if (req.user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }
    return this.usersService.remove(id);
  }
}
