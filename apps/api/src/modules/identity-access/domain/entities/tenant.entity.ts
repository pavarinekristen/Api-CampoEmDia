export type TenantType = 'AUTONOMO' | 'EMPRESA';

export class Tenant {
  private constructor(
    readonly id: string | undefined,
    readonly type: TenantType,
    readonly name: string,
    readonly document: string | null,
  ) {}

  /**
   * O profissional autônomo é modelado como um tenant "unipessoal" — não
   * existe branch de código separado para autônomo vs. empresa (ver plano
   * arquitetural, seção Multitenancy). A única diferença é `type` e as
   * permissões por papel aplicadas depois.
   */
  static createForAutonomo(name: string, document?: string): Tenant {
    if (name.trim().length < 2) {
      throw new Error('Nome do profissional é obrigatório.');
    }
    return new Tenant(undefined, 'AUTONOMO', name.trim(), document ?? null);
  }

  static createForEmpresa(name: string, document?: string): Tenant {
    if (name.trim().length < 2) {
      throw new Error('Nome da empresa é obrigatório.');
    }
    return new Tenant(undefined, 'EMPRESA', name.trim(), document ?? null);
  }
}
