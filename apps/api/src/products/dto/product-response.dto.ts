import { ApiProperty } from '@nestjs/swagger';

class ImageDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  url!: string;
  @ApiProperty({ required: false, nullable: true })
  altText?: string | null;
  @ApiProperty()
  isDefault!: boolean;
}

class ProductAttributeDto {
  @ApiProperty()
  name!: string;
}

class ProductAttributeValueDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  value!: string;
  @ApiProperty()
  slug!: string;
  @ApiProperty({ type: ProductAttributeDto })
  attribute!: ProductAttributeDto;
}

class ProductVariantAttributeDto {
  @ApiProperty({ type: ProductAttributeDto })
  attribute!: ProductAttributeDto;
  @ApiProperty()
  value!: string;
  @ApiProperty({ required: false, nullable: true })
  attributeValue?: ProductAttributeValueDto | null;
}

class ProductVariantDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  slug!: string;
  @ApiProperty()
  sku!: string;
  @ApiProperty()
  price!: number;
  @ApiProperty()
  stockQuantity!: number;
  @ApiProperty({ type: [ProductVariantAttributeDto] })
  ProductVariantAttribute!: ProductVariantAttributeDto[];
  @ApiProperty({ type: [ImageDto] })
  images!: ImageDto[];
}

export class ProductResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  baseSlug!: string;
  @ApiProperty()
  colorSlug!: string;
  @ApiProperty({ required: false })
  description?: string;
  @ApiProperty()
  price!: number;
  @ApiProperty({ type: [ImageDto] })
  colorSpecificImages!: ImageDto[];
  @ApiProperty({ type: [ProductVariantDto] })
  variantsForColor!: ProductVariantDto[];
  @ApiProperty({ type: [ProductAttributeValueDto] })
  availableColors!: ProductAttributeValueDto[];
}
