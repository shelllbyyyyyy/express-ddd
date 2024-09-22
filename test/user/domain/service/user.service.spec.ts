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
    createUser: jest.fn(),
    findUser: jest.fn(),
    findUserWithPassword: jest.fn(),
    deleteUser: jest.fn(),
    updatePassword: jest.fn(),
    userRepository: mockUserRepository,
  };

  beforeEach(() => {
    userService = mockUserService as unknown as UserService;

    jest.clearAllMocks();
  });

  it("Should be defined", () => {
    expect(userService).toBeDefined();
  });

  it("Should return user when createUser", async () => {
    mockUserService.findUser.mockResolvedValue(null);
    mockUserService.createUser.mockResolvedValue({
      id,
      username,
      email,
      password,
    });

    const user = await userService.createUser(createUser);

    expect(user).toEqual({ id, username, email, password });
    expect(mockUserService.createUser).toHaveBeenCalledWith({
      username,
      email,
      password,
    });
  });

  it("Should return user when find user by email", async () => {
    mockUserService.findUser.mockResolvedValue(user);

    const find = await userService.findUser(email);

    expect(find).toEqual(user);
    expect(mockUserService.findUser).toHaveBeenCalledWith(email);
  });

  it("Should return user with password when find user by email", async () => {
    mockUserService.findUserWithPassword.mockResolvedValue(userWithPasssword);

    const find = await userService.findUserWithPassword(email);

    expect(find).toEqual(userWithPasssword);
    expect(mockUserService.findUserWithPassword).toHaveBeenCalledWith(email);
  });

  it(`Should delete user success with this ${email}`, async () => {
    mockUserService.findUser.mockResolvedValue(user);

    const find = await userService.deleteUser(email);

    expect(find).toBeTruthy;
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(email);
  });

  it("Should return user with password when find user by email", async () => {
    mockUserService.updatePassword.mockResolvedValue(user.id);

    const find = await userService.updatePassword(update);

    expect(find).toEqual(user.id);
    expect(mockUserService.updatePassword).toHaveBeenCalledWith(update);
  });
});
