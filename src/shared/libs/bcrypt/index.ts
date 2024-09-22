import { hash, compare, genSalt } from "bcrypt";

const saltRounds = 10;

export class BcryptService {
  async hash(password: string): Promise<string> {
    const salt = await genSalt(saltRounds);

    return hash(password, salt);
  }

  async compare(inputPassword: string, dbPassword: string): Promise<boolean> {
    return await compare(inputPassword, dbPassword);
  }
}
