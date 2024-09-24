import { randomUUID } from "crypto";

import { UserService } from "@/user/domain/services/user.service";
import { User } from "@/user/domain/entities/user.entity";

describe("Use case", () => {
  let userService: UserService;

  const id = randomUUID();
  const username = "tes123";
  const email = "test@gmail.com";
  const password = "hashedPassword";
  const newPassword = "newHashedPassword";

  const user = {
    id,
    username,
    email,
  };

  const userWithPasssword = {
    id,
    username,
    email,
    password,
  };

  const createUser = {
    username,
    email,
    password,
  };

  const domainUser = User.createUser(userWithPasssword);
  const update = domainUser.updatePassword(newPassword);

  const mockUserRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findWithPassword: jest.fn(),
    delete: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockUserService = {
    createUser: jest.fn().mockResolvedValue({ id }),
    findUser: jest.fn().mockResolvedValue(user),
    findUserWithPassword: jest.fn().mockResolvedValue(userWithPasssword),
    deleteUser: jest.fn().mockResolvedValue(true),
    updatePassword: jest.fn().mockResolvedValue({ id, email }),
    userRepository: mockUserRepository,
  };

  beforeEach(() => {
    userService = mockUserService as unknown as UserService;

    jest.clearAllMocks();
  });

  it("Should be defined", () => {
    expect(userService).toBeDefined();
  });

  describe("Create user", () => {
    it("Should return user when createUser", async () => {
      const result = await userService.createUser(createUser);

      expect(result).toEqual({ id });
    });
  });

  describe("Find user", () => {
    it("Should return user when find user by email", async () => {
      const find = await userService.findUser(email);

      expect(find).toEqual(user);
    });
  });

  describe("Find user with password", () => {
    it("Should return user with password when find user by email", async () => {
      const find = await userService.findUserWithPassword(email);

      expect(find).toEqual(userWithPasssword);
    });
  });

  describe("Delete user", () => {
    it(`Should delete user success with this ${email}`, async () => {
      const find = await userService.deleteUser(email);

      expect(find).toBeTruthy();
    });
  });

  describe("Update password", () => {
    it("Should return user with password when find user by email", async () => {
      const find = await userService.updatePassword(update);

      expect(find).toEqual({ id, email });
    });
  });
});
