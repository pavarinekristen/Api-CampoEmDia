import { Module } from '@nestjs/common';
import { BillingController } from './interface/billing.controller';
import { CreateChargeUseCase } from './application/create-charge.use-case';
import { GetChargeUseCase } from './application/get-charge.use-case';
import { UpdateChargeUseCase } from './application/update-charge.use-case';
import { MarkChargePaidUseCase } from './application/mark-charge-paid.use-case';
import { CancelChargeUseCase } from './application/cancel-charge.use-case';

@Module({
  controllers: [BillingController],
  providers: [CreateChargeUseCase, GetChargeUseCase, UpdateChargeUseCase, MarkChargePaidUseCase, CancelChargeUseCase],
})
export class BillingModule {}
