import { randomUUID } from "crypto";
import { User } from "../entities/user.entity";

import { UserRepositoryImpl } from "@/user/persistence/user.repository.impl";

import { UserRepository } from "../repositories/user.repository";
import { UserFactory } from "../factories/user.factory";

const userRepositoryImpl = new UserRepositoryImpl();

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = userRepositoryImpl;
  }

  async createUser({
    email,
    password,
    username,
  }: {
    username: string;
    email: string;
    password: string;
  }) {
    const id = randomUUID();

    const newUser = User.createUser({ id, username, email, password });

    return await this.userRepository.create(newUser);
  }

  async findUser(email: string) {
    const result = await this.userRepository.find(email);

    return result;
  }

  async findUserById(id: string) {
    const result = await this.userRepository.findById(id);

    return result;
  }

  async findUserWithPassword(email: string) {
    const result = await this.userRepository.findWithPassword(email);

    return result;
  }

  async deleteUser(email: string) {
    await this.userRepository.delete(email);
  }

  async updatePassword(data: User) {
    return await this.userRepository.updatePassword(data);
  }
}
