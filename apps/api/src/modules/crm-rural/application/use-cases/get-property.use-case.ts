import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROPERTY_REPOSITORY, PropertyRepository } from '../../domain/repositories/property.repository';

@Injectable()
export class GetPropertyUseCase {
  constructor(@Inject(PROPERTY_REPOSITORY) private readonly properties: PropertyRepository) {}

  async execute(id: string) {
    const property = await this.properties.findById(id);
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada.');
    }
    return property;
  }
}
