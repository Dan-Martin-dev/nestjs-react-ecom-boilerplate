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
  Request 
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthGuard } from '../common/guards/auth.guard';
import { CreateReviewDto, CreateReviewSchema } from './dto/create-review.dto';
import { PaginationDto, PaginationSchema } from '../common/dto/pagination.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(CreateReviewSchema))
  create(@Request() req: any, @Body() createReviewDto: CreateReviewDto): Promise<any> {
    return this.reviewsService.create(req.user.sub, createReviewDto);
  }

  @Get('product/:productId')
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findProductReviews(
    @Param('productId') productId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reviewsService.findProductReviews(productId, paginationDto);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findUserReviews(@Request() req: any, @Query() paginationDto: PaginationDto): Promise<any> {
    return this.reviewsService.findUserReviews(req.user.sub, paginationDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Request() req: any, @Param('id') id: string, @Body() updateReviewDto: any): Promise<any> {
    return this.reviewsService.update(req.user.sub, id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Request() req: any, @Param('id') id: string): Promise<any> {
    return this.reviewsService.remove(req.user.sub, id);
  }
}
