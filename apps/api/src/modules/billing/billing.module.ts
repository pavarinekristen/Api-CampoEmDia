import { Module } from '@nestjs/common';
import { BillingController } from './interface/billing.controller';
import { CreateChargeUseCase } from './application/create-charge.use-case';

@Module({
  controllers: [BillingController],
  providers: [CreateChargeUseCase],
})
export class BillingModule {}
