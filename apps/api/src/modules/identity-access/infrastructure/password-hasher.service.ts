import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Único ponto do sistema que sabe qual algoritmo de hash é usado — evita
 * duplicar `bcrypt`/rounds em cada use-case que precisa lidar com senha
 * (registro, login, convite de novo usuário) e facilita trocar o
 * algoritmo no futuro sem caçar todos os call sites.
 */
@Injectable()
export class PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
