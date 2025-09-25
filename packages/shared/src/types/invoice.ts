// Invoice types and interfaces for Argentina e-commerce
export const InvoiceType = {
  A: 'A',       // Used for B2B with VAT discrimination
  B: 'B',       // Used for B2C, no VAT discrimination
  C: 'C',       // Used for exempt taxpayers
  M: 'M',       // Used for monotributo
  E: 'E',       // Used for exports
  NC_A: 'NC_A', // Credit note type A
  NC_B: 'NC_B', // Credit note type B
  NC_C: 'NC_C', // Credit note type C
  ND_A: 'ND_A', // Debit note type A
  ND_B: 'ND_B', // Debit note type B
} as const;
export type InvoiceType = typeof InvoiceType[keyof typeof InvoiceType];

export interface TaxBreakdown {
  rate: number;       // Tax rate (e.g., 21, 10.5)
  base: string;       // Base amount for this tax rate
  amount: string;     // Tax amount
  description?: string; // Description of the tax
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;      // AFIP assigned document number
  pointOfSale: number;        // Punto de Venta (POS) number registered in AFIP
  type: InvoiceType;          // A, B, C, etc.
  cae?: string;               // CAE number (Electronic Authorization Code)
  caeExpirationDate?: string; // When the CAE expires
  issueDate: string;          // When the invoice was issued
  netAmount: string;          // Amount before taxes
  taxAmount: string;          // Tax amount (IVA)
  totalAmount: string;        // Total with taxes
  taxBreakdown?: TaxBreakdown[]; // Detailed tax breakdown (different IVA rates: 21%, 10.5%, etc.)
  recipientTaxId?: string;    // Customer's CUIT/CUIL
  recipientName?: string;     // Customer's legal name
  recipientType?: string;     // Responsible inscripto, consumidor final, etc.
  notes?: string;             // Additional fiscal notes
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  orderId: string;
  invoiceNumber: string;
  pointOfSale: number;
  type: InvoiceType;
  cae?: string;
  caeExpirationDate?: string;
  issueDate: string;
  netAmount: string;
  taxAmount: string;
  totalAmount: string;
  taxBreakdown?: TaxBreakdown[];
  recipientTaxId?: string;
  recipientName?: string;
  recipientType?: string;
  notes?: string;
}
