import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceType } from '@repo/db';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<any> {
    const {
      orderId,
      invoiceNumber,
      pointOfSale,
      type,
      cae,
      caeExpirationDate,
      issueDate,
      netAmount,
      taxAmount,
      totalAmount,
      taxBreakdown,
      recipientTaxId,
      recipientName,
      recipientType,
      notes,
    } = createInvoiceDto;

    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Check if invoice already exists for this order
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { orderId },
    });

    if (existingInvoice) {
      throw new NotFoundException(
        `Invoice already exists for order with ID ${orderId}`,
      );
    }

    // Create the invoice
    return this.prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber,
        pointOfSale,
        type,
        cae,
        caeExpirationDate: caeExpirationDate
          ? new Date(caeExpirationDate)
          : undefined,
        issueDate: new Date(issueDate),
        netAmount,
        taxAmount,
        totalAmount,
        taxBreakdown: taxBreakdown ? JSON.stringify(taxBreakdown) : undefined,
        recipientTaxId,
        recipientName,
        recipientType,
        notes,
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                taxId: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Convert taxBreakdown from JSON string to object if it exists
    if (invoice.taxBreakdown) {
      return {
        ...invoice,
        taxBreakdown: JSON.parse(String(invoice.taxBreakdown)),
      };
    }

    return invoice;
  }

  async findByOrder(orderId: string): Promise<any> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { orderId },
    });

    if (!invoice) {
      throw new NotFoundException(
        `Invoice for order with ID ${orderId} not found`,
      );
    }

    // Convert taxBreakdown from JSON string to object if it exists
    if (invoice.taxBreakdown) {
      return {
        ...invoice,
        taxBreakdown: JSON.parse(String(invoice.taxBreakdown)),
      };
    }

    return invoice;
  }

  async findAll(): Promise<any> {
    const invoices = await this.prisma.invoice.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        issueDate: 'desc',
      },
    });

    // Convert taxBreakdown from JSON string to object if it exists for each invoice
    return invoices.map((invoice) => {
      if (invoice.taxBreakdown) {
        return {
          ...invoice,
          taxBreakdown: JSON.parse(String(invoice.taxBreakdown)),
        };
      }
      return invoice;
    });
  }

  // Helper method to get order by invoice ID
  async getOrderByInvoiceId(invoiceId: string): Promise<any> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        order: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    return invoice.order;
  }

  // Helper method to get order by ID
  async getOrderById(orderId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    return order; // Can be null
  }
}
