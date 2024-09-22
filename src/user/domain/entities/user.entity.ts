import { Email } from "../values-object/email";

export type TUser = {
  id: string;
  username: string;
  email: string;
  password: string;
};

export type UserResponse = TUser & {
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  constructor(
    private readonly id: string,
    private readonly username: string,
    private readonly email: Email,
    private readonly password: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get Id() {
    return this.id;
  }

  get Username() {
    return this.username;
  }

  get Email() {
    return this.email.value;
  }

  get Password() {
    return this.password;
  }

  get CreatedAt() {
    return this.createdAt;
  }

  get UpdatedAt() {
    return this.updatedAt;
  }

  static createUser(data: TUser): User {
    const { id, email, password, username } = data;
    const createdAt = new Date();
    const updatedAt = createdAt;
    const newEmail = new Email(email);

    return new User(id, username, newEmail, password, createdAt, updatedAt);
  }

  updatePassword(password: string): User {
    return new User(
      this.id,
      this.username,
      this.email,
      password,
      this.createdAt,
      new Date()
    );
  }
}
