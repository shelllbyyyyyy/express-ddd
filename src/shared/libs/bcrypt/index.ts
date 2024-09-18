import { hash, compare, genSalt } from "bcrypt";

const saltRounds = 10;

export class BcryptService {
  async hash(password: string) {
    const salt = await genSalt(saltRounds);

    return hash(password, salt);
  }

  compare(inputPassword: string, dbPassword: string) {
    return compare(inputPassword, dbPassword);
  }
}
