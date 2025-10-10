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
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@repo/db';
// Import shared schemas
import { CreateProductSchema } from '@repo/shared';
import { CreateProductDto } from '../common/validators';
import {
  ProductFilterDto,
  ProductFilterSchema,
} from './dto/product-filter.dto';
import {
  UpdateProductDto,
  UpdateProductSchema,
} from './dto/update-product.dto';

/**
 * Products Controller
 *
 * Handles all product-related HTTP endpoints for the e-commerce API.
 * Provides CRUD operations for products with proper authentication,
 * authorization, and validation.
 *
 * Features:
 * - JWT authentication required for write operations
 * - Admin role required for create/update/delete operations
 * - Zod schema validation for all inputs
 * - Swagger documentation for API endpoints
 * - Pagination and filtering support for product listings
 */
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a new product
   *
   * Creates a new product in the catalog. Requires admin authentication.
   * The product data is validated using Zod schemas before processing.
   *
   * @param createProductDto - Validated product creation data
   * @returns Promise<Product> - The created product with all relations
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Require authentication and admin role
  @Roles(Role.ADMIN) // Only ADMIN users can create products
  @UsePipes(new ZodValidationPipe(CreateProductSchema)) // Validate input with Zod
  @ApiBearerAuth() // Require Bearer token in Swagger
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<import('@repo/db').Product> {
    return this.productsService.create(createProductDto);
  }

  /**
   * Get all products with pagination and filters
   *
   * Retrieves a paginated list of products with optional filtering.
   * Public endpoint - no authentication required.
   * Supports filtering by category, search terms, and pagination.
   *
   * @param filterDto - Query parameters for filtering and pagination
   * @returns Promise with products array and pagination metadata
   */
  @Get()
  @UsePipes(new ZodValidationPipe(ProductFilterSchema)) // Validate query params
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category slug',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in product name and description',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  findAll(@Query() filterDto: ProductFilterDto): Promise<{
    data: import('@repo/db').Product[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.productsService.findAll(filterDto);
  }

  /**
   * Get best selling products
   *
   * Retrieves a list of best-selling products based on sales data.
   * Public endpoint for displaying featured products on the storefront.
   *
   * @param limit - Number of bestsellers to return (default: 10)
   * @returns Promise with array of best-selling products
   */
  @Get('bestsellers')
  @ApiOperation({ summary: 'Get best selling products' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of bestsellers to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Bestsellers retrieved successfully',
  })
  getBestsellers(@Query('limit') limit = '10') {
    return this.productsService.getBestsellers(parseInt(limit, 10));
  }

  /**
   * Get a product by ID
   *
   * Retrieves a single product by its unique identifier.
   * Public endpoint for product detail pages.
   *
   * @param id - Product unique identifier
   * @returns Promise<Product> - The requested product with all relations
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string): Promise<import('@repo/db').Product> {
    return this.productsService.findOne(id);
  }

  /**
   * Get a product by slug
   *
   * Retrieves a single product by its URL-friendly slug.
   * Public endpoint for SEO-friendly product URLs.
   * Used by the frontend for product detail pages.
   *
   * @param slug - Product URL slug (e.g., 'heavyweight-white-tee')
   * @returns Promise<Product> - The requested product with all relations
   */
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findBySlug(@Param('slug') slug: string): Promise<import('@repo/db').Product> {
    return this.productsService.findBySlug(slug);
  }

  /**
   * Update a product
   *
   * Updates an existing product with new data. Requires admin authentication.
   * Supports partial updates - only provided fields are updated.
   * Used for editing product information, prices, inventory, etc.
   *
   * @param id - Product unique identifier
   * @param updateProductDto - Partial product update data
   * @returns Promise<Product> - The updated product with all relations
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Require authentication and admin role
  @Roles(Role.ADMIN) // Only ADMIN users can update products
  @ApiBearerAuth() // Require Bearer token in Swagger
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @UsePipes(new ZodValidationPipe(UpdateProductSchema)) // Validate input
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<import('@repo/db').Product> {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * Delete a product
   *
   * Permanently removes a product from the catalog. Requires admin authentication.
   * This is a destructive operation that cannot be undone.
   * Consider soft deletes for production environments.
   *
   * @param id - Product unique identifier
   * @returns Promise<Product> - The deleted product data
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Require authentication and admin role
  @Roles(Role.ADMIN) // Only ADMIN users can delete products
  @ApiBearerAuth() // Require Bearer token in Swagger
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string): Promise<import('@repo/db').Product> {
    return this.productsService.remove(id);
  }
}
