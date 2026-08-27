import { Inject, Injectable } from '@nestjs/common';
import { LOTE_REPOSITORY, LoteRepository } from '../../domain/repositories/lote.repository';

@Injectable()
export class ListLotesUseCase {
  constructor(@Inject(LOTE_REPOSITORY) private readonly lotes: LoteRepository) {}

  async execute(propertyId: string) {
    return this.lotes.findAllByProperty(propertyId);
  }
}
