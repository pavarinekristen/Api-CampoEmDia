import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateChargeDto } from './create-charge.dto';

// clientId nunca é editável — trocar o dono de uma cobrança já emitida não
// faz sentido de negócio; cancele e crie outra se for o caso.
export class UpdateChargeDto extends PartialType(OmitType(CreateChargeDto, ['clientId'] as const)) {}
