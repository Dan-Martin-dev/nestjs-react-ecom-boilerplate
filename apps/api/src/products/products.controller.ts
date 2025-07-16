// monorepo-ecom/backend/src/products/products.controller.ts
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
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@repo/db';
import { CreateProductDto, CreateProductSchema } from './dto/create-product.dto';
import { ProductFilterDto, ProductFilterSchema } from './dto/product-filter.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
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

  @Get(':id')
  findOne(@Param('id') id: string): Promise<import('@repo/db').Product> {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string): Promise<import('@repo/db').Product> {
    return this.productsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: any): Promise<import('@repo/db').Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string): Promise<import('@repo/db').Product> {
    return this.productsService.remove(id);
  }
}