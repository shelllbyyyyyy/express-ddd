import { User } from "../entities/user.entity";

export abstract class UserRepository {
  abstract create(data: User): Promise<User>;
  abstract find(email: string): Promise<User>;
  abstract findById(email: string): Promise<User>;
  abstract findWithPassword(email: string): Promise<User>;
  abstract delete(email: string): Promise<boolean>;
  abstract updatePassword(data: User): Promise<User>;
}
