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
import { ReviewsService } from './reviews.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto, CreateReviewSchema } from './dto/create-review.dto';
import { UpdateReviewDto, UpdateReviewSchema } from './dto/update-review.dto';
import { PaginationDto, PaginationSchema } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(CreateReviewSchema))
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.sub, createReviewDto);
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
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findUserReviews(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reviewsService.findUserReviews(user.sub, paginationDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(UpdateReviewSchema))
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(user.sub, id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.reviewsService.remove(user.sub, id);
  }
}
