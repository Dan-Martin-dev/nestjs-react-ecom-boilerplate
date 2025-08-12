// Discount types and interfaces
export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
} as const;
export type DiscountType = typeof DiscountType[keyof typeof DiscountType];

export interface Discount {
  id: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  usageLimit?: number;
  usageLimitPerUser?: number;
  minimumSpend?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountDto {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  usageLimit?: number;
  usageLimitPerUser?: number;
  minimumSpend?: number;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
}
