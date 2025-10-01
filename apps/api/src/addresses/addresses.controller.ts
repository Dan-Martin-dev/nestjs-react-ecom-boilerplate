import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import {
  CreateAddressDto,
  CreateAddressSchema,
} from './dto/create-address.dto';
import {
  UpdateAddressDto,
  UpdateAddressSchema,
} from './dto/update-address.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateAddressSchema))
  create(
    @Body() createAddressDto: CreateAddressDto,
    @GetUser('id') userId: string,
  ): Promise<import('@repo/db').Address> {
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
  ): Promise<import('@repo/db').Address[]> {
    return this.addressesService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<import('@repo/db').Address> {
    return this.addressesService.findOne(id, userId);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateAddressSchema))
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @GetUser('id') userId: string,
  ): Promise<import('@repo/db').Address> {
    return this.addressesService.update(id, userId, updateAddressDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<import('@repo/db').Address> {
    return this.addressesService.remove(id, userId);
  }
}
