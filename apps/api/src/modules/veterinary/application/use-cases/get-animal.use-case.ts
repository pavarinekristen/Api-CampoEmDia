import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ANIMAL_REPOSITORY, AnimalRepository } from '../../domain/repositories/animal.repository';

@Injectable()
export class GetAnimalUseCase {
  constructor(@Inject(ANIMAL_REPOSITORY) private readonly animals: AnimalRepository) {}

  async execute(id: string) {
    const animal = await this.animals.findById(id);
    if (!animal) {
      throw new NotFoundException('Animal não encontrado.');
    }
    return animal;
  }
}
