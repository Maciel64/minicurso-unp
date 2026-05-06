import { randomBytes, scryptSync } from "crypto";

export class Hasher {
  hash(value: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(value, salt, 64).toString("hex");
    const hashedPassword = `${salt}:${hash}`;

    return hashedPassword
  }
}