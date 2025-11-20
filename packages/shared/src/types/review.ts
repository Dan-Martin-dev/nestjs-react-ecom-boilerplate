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

// DTOs now come from schemas/review.ts (schema-first approach)
