import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCustomFieldDto } from './create-custom-field.dto';

// entityType, key e fieldType nunca são editáveis — mudar o tipo de um
// campo depois que já existem valores salvos quebraria os dados
// existentes; se precisar mudar o tipo, desative e crie outro campo.
export class UpdateCustomFieldDto extends PartialType(OmitType(CreateCustomFieldDto, ['entityType', 'key', 'fieldType'] as const)) {}
