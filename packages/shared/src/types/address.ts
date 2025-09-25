// Address types and interfaces
export const AddressType = {
  SHIPPING: 'SHIPPING',
  BILLING: 'BILLING'
} as const;
export type AddressType = typeof AddressType[keyof typeof AddressType];

export interface Address {
  id: string;
  userId: string;
  street: string;
  streetNumber?: string;
  city: string;
  province: string;
  zipCode: string;
  phone?: string;         // Contact phone for deliveries (required by most carriers in Argentina)
  neighborhood?: string;  // Barrio - important in Argentina
  floor?: string;         // Piso (for apartments)
  apartment?: string;     // Departamento
  country: string;
  type: AddressType;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  street: string;
  streetNumber?: string;
  city: string;
  province: string;
  zipCode: string;
  phone?: string;         // Contact phone for deliveries (required by most carriers in Argentina)
  neighborhood?: string;  // Barrio - important in Argentina
  floor?: string;         // Piso (for apartments)
  apartment?: string;     // Departamento
  country: string;
  type: AddressType;
  isDefault?: boolean;
}
