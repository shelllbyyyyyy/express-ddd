import { TUser, User, UserResponse } from "../entities/user.entity";
import { Email } from "../values-object/email";

export class UserFactory {
  static toDomain(row: any): User {
    if (!row) return;

    return new User(
      row.id,
      row.username,
      new Email(row.email),
      undefined,
      row.createdAt,
      row.updatedAt
    );
  }

  static toResponse(data: User): UserResponse {
    return {
      id: data.Id,
      username: data.Username,
      email: data.Email,
      password: undefined,
      createdAt: data.CreatedAt,
      updatedAt: data.UpdatedAt,
    };
  }

  static toDomainWithPassword(row: any): User {
    if (!row) return;

    const user = new User(
      row.id,
      row.username,
      new Email(row.email),
      row.password,
      row.createdAt,
      row.updatedAt
    );

    return user;
  }

  static toDomains(rows: any[]): User[] {
    if (!rows) return;

    return rows.map((row: any) => this.toDomain(row));
  }

  static toPersist(data: User): TUser {
    return {
      id: data.Id,
      username: data.Username,
      email: data.Email,
      password: data.Password,
    };
  }
}
