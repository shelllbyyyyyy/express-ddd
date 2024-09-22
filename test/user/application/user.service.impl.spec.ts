import { randomUUID } from "crypto";

import { UserServiceImpl } from "@/user/application/user.service.impl";
import { UserService } from "@/user/domain/services/user.service";
import { HttpException } from "@/shared/common/exceptions/http-exception";
import { TokenService } from "@/shared/libs/token";
import { BcryptService } from "@/shared/libs/bcrypt";
import { HttpStatus } from "@/shared/common/enum/http-status";
import { User } from "@/user/domain/entities/user.entity";

describe("Use case", () => {
  let userServiceImpl: UserServiceImpl;
  let userService: UserService;
  let bcryptService: BcryptService;
  let tokenService: TokenService;

  const id = randomUUID();
  const username = "tes123";
  const email = "test@gmail.com";
  const password = "12345678";
  const newPassword = "123456789";

  const user = {
    id,
    username,
    email,
    password: "hashedPassword",
  };

  const updateUser = User.createUser(user);

  const final = updateUser.updatePassword("newHashedPassword");

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

  const mockBcryptService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockTokenService = {
    generateAccessToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  beforeEach(() => {
    userService = mockUserService as unknown as UserService;
    bcryptService = mockBcryptService;
    tokenService = mockTokenService;
    userServiceImpl = new UserServiceImpl(userService, bcryptService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(userService).toBeDefined();
    expect(userServiceImpl).toBeDefined();
    expect(bcryptService).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  it(`Should return user with this ${email} when find user`, async () => {
    mockUserService.findUser.mockResolvedValue({
      id,
      username,
      email,
      password: "hasedPassword",
    });

    const user = await userServiceImpl.findUser(email);

    expect(user).toEqual(user);
    expect(mockUserService.findUser).toHaveBeenCalledWith(email);
  });

  it(`Should return http exception 404 user not found with this ${email} when find user`, async () => {
    mockUserService.findUser.mockResolvedValue(null);

    await expect(userServiceImpl.findUser(email)).rejects.toThrow(
      new HttpException(404, "User not found")
    );
    expect(mockUserService.findUser).toHaveBeenCalledWith(email);
  });

  it(`Should return 200 password updated with this ${email} when update password`, async () => {
    mockUserService.findUserWithPassword.mockResolvedValue(updateUser);
    mockBcryptService.compare
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    mockBcryptService.hash.mockResolvedValue("newHashedPassword");
    mockUserService.updatePassword.mockResolvedValue(final);

    const result = await userServiceImpl.updateUser(
      email,
      password,
      newPassword
    );

    expect(result).toEqual({ id });

    expect(mockUserService.findUserWithPassword).toHaveBeenCalledWith(email);
    expect(mockBcryptService.compare).toHaveBeenCalledTimes(2);
    expect(mockBcryptService.compare).toHaveBeenNthCalledWith(
      1,
      password,
      "hashedPassword"
    );
    expect(mockBcryptService.compare).toHaveBeenNthCalledWith(
      2,
      newPassword,
      "hashedPassword"
    );
    expect(mockBcryptService.hash).toHaveBeenCalledWith(newPassword);
  });

  it(`Should return 404 user not found with this ${email} when update password`, async () => {
    mockUserService.findUserWithPassword.mockResolvedValue(null);

    await expect(
      userServiceImpl.updateUser(email, "12345678", "123456789")
    ).rejects.toThrow(new HttpException(404, "User not found"));

    expect(mockUserService.findUserWithPassword).toHaveBeenCalledWith(email);
    expect(mockBcryptService.compare).not.toHaveBeenCalled();
    expect(mockBcryptService.hash).not.toHaveBeenCalled();
  });

  it(`Should return 401 password not match with this ${email} when update password`, async () => {
    mockUserService.findUserWithPassword.mockResolvedValue(updateUser);
    mockBcryptService.compare
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    await expect(
      userServiceImpl.updateUser(email, newPassword, newPassword)
    ).rejects.toThrow(new HttpException(401, "Password not match"));
    expect(mockUserService.findUserWithPassword).toHaveBeenCalledWith(email);
    expect(mockBcryptService.compare).toHaveBeenCalledTimes(2);
    expect(mockBcryptService.compare).toHaveBeenNthCalledWith(
      1,
      newPassword,
      "hashedPassword"
    );
    expect(mockBcryptService.compare).toHaveBeenNthCalledWith(
      2,
      newPassword,
      "hashedPassword"
    );
    expect(mockBcryptService.hash).not.toHaveBeenCalled();
  });

  it(`Should return 400 new password have to be different with old password with this ${email} when update password`, async () => {
    mockUserService.findUserWithPassword.mockResolvedValue(updateUser);
    mockBcryptService.compare
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    await expect(
      userServiceImpl.updateUser(email, password, password)
    ).rejects.toThrow(
      new HttpException(
        400,
        "New Password have to be different with old password"
      )
    );
    expect(mockUserService.findUserWithPassword).toHaveBeenCalledWith(email);
    expect(mockBcryptService.compare).toHaveBeenCalledTimes(2);
    expect(mockBcryptService.compare).toHaveBeenNthCalledWith(
      1,
      password,
      "hashedPassword"
    );
    expect(mockBcryptService.compare).toHaveBeenNthCalledWith(
      2,
      password,
      "hashedPassword"
    );
    expect(mockBcryptService.hash).not.toHaveBeenCalled();
  });

  it(`Should delete user success with this ${email}`, async () => {
    mockUserService.findUser.mockResolvedValue(user);

    const result = await userServiceImpl.deleteUser(email);

    expect(result).toBeTruthy;
    expect(mockUserService.findUser).toHaveBeenCalledWith(email);
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(email);
  });

  it(`Should return http exception 404 user not found with this ${email} when deleting user`, async () => {
    mockUserService.findUser.mockResolvedValue(null);

    await expect(userServiceImpl.deleteUser(email)).rejects.toThrow(
      new HttpException(HttpStatus.NOT_FOUND, `User not found`)
    );

    expect(mockUserService.findUser).toHaveBeenCalledWith(email);
    expect(mockUserService.createUser).not.toHaveBeenCalled();
  });
});
