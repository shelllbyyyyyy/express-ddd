import { randomUUID } from "crypto";

import { UserRepositoryImpl } from "@/user/persistence/user.repository.impl";
import { User } from "@/user/domain/entities/user.entity";

describe("Use case", () => {
  let userRepositoryImpl: UserRepositoryImpl;

  const id = randomUUID();
  const username = "tes123";
  const email = "test@gmail.com";
  const password = "hashedPassword";
  const newPassword = "newHashedPassword";
  const createdAt = new Date();
  const updatedAt = createdAt;

  const user = {
    id,
    username,
    email,
  };

  const userWithPasssword = {
    id,
    username,
    email,
  };

  const createUser = User.createUser({ id, username, email, password });
  const update = createUser.updatePassword(newPassword);

  const mockDbService = {
    query: jest.fn(),
  };

  const mockUserRepositoryImpl = {
    create: jest.fn(),
    find: jest.fn(),
    findWithPassword: jest.fn(),
    delete: jest.fn(),
    updatePassword: jest.fn(),
    dbService: mockDbService,
  };

  beforeEach(() => {
    userRepositoryImpl =
      mockUserRepositoryImpl as unknown as UserRepositoryImpl;

    jest.clearAllMocks();
  });

  it("Should have defined", () => {
    expect(userRepositoryImpl).toBeDefined();
  });

  it("Should return userId when creating a user", async () => {
    mockUserRepositoryImpl.create.mockResolvedValue({ id });

    const user = await userRepositoryImpl.create(createUser);

    expect(user).toEqual({ id });
    expect(mockUserRepositoryImpl.create).toHaveBeenCalledWith(createUser);
  });

  it("Should return user when find with password user with email", async () => {
    mockUserRepositoryImpl.findWithPassword.mockResolvedValue(
      userWithPasssword
    );

    const result = await userRepositoryImpl.findWithPassword(email);

    expect(result).toEqual(userWithPasssword);
    expect(mockUserRepositoryImpl.findWithPassword).toHaveBeenCalledWith(email);
  });

  it("Should return user when find user with email", async () => {
    mockUserRepositoryImpl.find.mockResolvedValue(user);

    const result = await userRepositoryImpl.find(email);

    expect(result).toEqual(user);
    expect(mockUserRepositoryImpl.find).toHaveBeenCalledWith(email);
  });

  it(`Should delete user success with this ${email}`, async () => {
    const result = await userRepositoryImpl.delete(email);

    expect(result).toBeTruthy;
  });

  it(`Should update password success`, async () => {
    mockUserRepositoryImpl.updatePassword.mockResolvedValue({ id });
    const result = await userRepositoryImpl.updatePassword(update);

    expect(result).toEqual({ id });
  });
});
