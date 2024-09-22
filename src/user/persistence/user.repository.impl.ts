import { DatabaseService } from "@/shared/libs/pg/pg-service";

import { User, UserResponse } from "../domain/entities/user.entity";
import { UserRepository } from "../domain/repositories/user.repository";
import { UserFactory } from "../domain/factories/user.factory";

export class UserRepositoryImpl implements UserRepository {
  private dbService = new DatabaseService();

  async create(data: User): Promise<User> {
    const persist = UserFactory.toPersist(data);

    const { email, password, username } = persist;

    const query = `INSERT INTO users (username, email, password)
                   VALUES ($1, $2, $3)
                   RETURNING id;`;

    const result = await this.dbService.query(query, [
      username,
      email,
      password,
    ]);

    return result[0];
  }

  async find(email: string): Promise<User> {
    const query = `SELECT id, username, email, "createdAt", "updatedAt" FROM users WHERE email = $1;`;

    const result = await this.dbService.query(query, [email]);

    return UserFactory.toDomain(result[0] as UserResponse);
  }

  async findById(id: string): Promise<User> {
    const query = `SELECT id, username, email, "createdAt", "updatedAt" FROM users WHERE id = $1;`;

    const result = await this.dbService.query(query, [id]);

    return UserFactory.toDomain(result[0] as UserResponse);
  }

  async findWithPassword(email: string): Promise<User> {
    const query = `SELECT * FROM users WHERE email = $1;`;

    const result = await this.dbService.query(query, [email]);

    return UserFactory.toDomainWithPassword(result[0] as UserResponse);
  }

  async delete(email: string): Promise<boolean> {
    const query = `DELETE FROM users WHERE email = $1;`;

    await this.dbService.query(query, [email]);

    return true;
  }

  async updatePassword(data: User): Promise<User> {
    const persist = UserFactory.toPersist(data);

    const { email, password } = persist;

    const query = `UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email;`;

    const result = await this.dbService.query(query, [password, email]);

    return UserFactory.toDomain(result[0] as UserResponse);
  }
}
