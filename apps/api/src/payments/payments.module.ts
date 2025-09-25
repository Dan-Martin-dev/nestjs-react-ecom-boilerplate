import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadoPagoService } from './providers/mercadopago.service';
import { RapiPagoService } from './providers/rapipago.service'; 
import { PagoFacilService } from './providers/pagofacil.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService, 
    MercadoPagoService,
    RapiPagoService,
    PagoFacilService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
