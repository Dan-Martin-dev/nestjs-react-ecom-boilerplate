import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CategoryFiltersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeChildren?: boolean = false;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onlyRootCategories?: boolean = false;
}
