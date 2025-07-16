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
  Request,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, CreateAddressSchema } from './dto/create-address.dto';
import { UpdateAddressDto, UpdateAddressSchema } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateAddressSchema))
  create(@Body() createAddressDto: CreateAddressDto, @Request() req: any): Promise<import('@repo/db').Address> {
    const userId = req.user.sub; // 'sub' from JWT payload is the user ID
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  findAll(@Request() req: any): Promise<import('@repo/db').Address[]> {
    const userId = req.user.sub;
    return this.addressesService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any): Promise<import('@repo/db').Address> {
    const userId = req.user.sub;
    return this.addressesService.findOne(id, userId);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateAddressSchema))
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req: any,
  ): Promise<import('@repo/db').Address> {
    const userId = req.user.sub;
    return this.addressesService.update(id, userId, updateAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any): Promise<import('@repo/db').Address> {
    const userId = req.user.sub;
    return this.addressesService.remove(id, userId);
  }
}