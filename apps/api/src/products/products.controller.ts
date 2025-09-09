import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  UsePipes 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@repo/db';
// Import shared schemas
import { CreateProductSchema } from '@repo/shared/src/schemas/product';
import { CreateProductDto } from '../common/validators';
import { ProductFilterDto, ProductFilterSchema } from './dto/product-filter.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  create(@Body() createProductDto: CreateProductDto): Promise<import('@repo/db').Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(ProductFilterSchema))
  findAll(@Query() filterDto: ProductFilterDto): Promise<{ data: import('@repo/db').Product[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    return this.productsService.findAll(filterDto);
  }

  @Get('bestsellers')
  getBestsellers(@Query('limit') limit = '10') {
    return this.productsService.getBestsellers(parseInt(limit, 10));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<import('@repo/db').Product> {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string): Promise<import('@repo/db').Product> {
    return this.productsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: any): Promise<import('@repo/db').Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string): Promise<import('@repo/db').Product> {
    return this.productsService.remove(id);
  }
}