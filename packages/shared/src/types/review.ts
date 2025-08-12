// Review types and interfaces
export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  user: {
    id: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment?: string;
}
