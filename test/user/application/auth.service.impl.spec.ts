import { randomUUID } from "crypto";
import Redis from "ioredis";

import { AuthServiceImpl } from "@/user/application/auth.service.impl";
import { UserService } from "@/user/domain/services/user.service";
import { HttpException } from "@/shared/common/exceptions/http-exception";
import { TokenService } from "@/shared/libs/token";
import { BcryptService } from "@/shared/libs/bcrypt";
import { redis } from "@/shared/libs/redis";
import { HttpStatus } from "@/shared/common/enum/http-status";
import { User } from "@/user/domain/entities/user.entity";

describe("Use case", () => {
  let authServiceImpl: AuthServiceImpl;
  let userService: UserService;
  let bcryptService: BcryptService;
  let tokenService: TokenService;
  let redisService: Redis;

  const id = randomUUID();
  const username = "tes123";
  const email = "test@gmail.com";
  const password = "12345678";
  const hashedPassword = "hashedPassword";

  const access_token = "access_token";
  const refresh_token = "refresh_token";

  const user = {
    id,
    username,
    email,
    password: "hashedPassword",
  };
  const wrongEmail = {
    username,
    email: "tes123.com",
    password,
  };

  const createUser = {
    username,
    email,
    password,
  };

  const updateUser = User.createUser(user);

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

  beforeEach(async () => {
    userService = mockUserService as unknown as UserService;
    bcryptService = mockBcryptService;
    tokenService = mockTokenService;
    redisService = redis;
    authServiceImpl = new AuthServiceImpl(
      userService,
      bcryptService,
      tokenService
    );

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await redisService.quit();
  });

  it("should be defined", () => {
    expect(userService).toBeDefined();
    expect(bcryptService).toBeDefined();
    expect(tokenService).toBeDefined();
    expect(redisService).toBeDefined();
  });

  it("Should return user when register", async () => {
    mockUserService.findUser.mockResolvedValue(null);
    mockBcryptService.hash.mockResolvedValue(hashedPassword);
    mockUserService.createUser.mockResolvedValue(user);

    const result = await authServiceImpl.register(createUser);

    expect(result).toEqual(user);
    expect(mockUserService.findUser).toHaveBeenCalledWith(email);
    expect(mockUserService.createUser).toHaveBeenCalledWith({
      username,
      email,
      password: "hashedPassword",
    });
  });

  it("Should throw error invalid email format when register", async () => {
    mockUserService.findUser.mockResolvedValue(null);
    mockBcryptService.hash.mockResolvedValue(hashedPassword);
    mockUserService.createUser.mockResolvedValue(null);

    await expect(authServiceImpl.register(wrongEmail)).rejects.toThrow(
      new Error("Invalid email format")
    );

    expect(mockUserService.findUser).toHaveBeenCalledWith(wrongEmail.email);
    expect(mockUserService.createUser).toHaveBeenCalledWith({
      username,
      email: wrongEmail.email,
      password: hashedPassword,
    });
  });

  it(`Should return http exception 409 This email ${email} already exists when register`, async () => {
    mockUserService.findUser.mockResolvedValue(updateUser);
    mockBcryptService.hash.mockResolvedValue("hashedPassword");
    mockUserService.createUser.mockResolvedValue({
      id,
      username,
      email,
      password: "hasedPassword",
    });

    await expect(authServiceImpl.register(createUser)).rejects.toThrow(
      new HttpException(
        HttpStatus.CONFLICT,
        `This email ${email} already exists`
      )
    );

    expect(mockUserService.findUser).toHaveBeenCalledWith(email);
    expect(mockUserService.createUser).not.toHaveBeenCalled();
  });

  it("Should return token when login", async () => {
    mockUserService.findUserWithPassword.mockResolvedValue(updateUser);
    mockBcryptService.compare.mockResolvedValue(true);
    mockTokenService.generateAccessToken.mockReturnValue(access_token);
    mockTokenService.generateRefreshToken.mockReturnValue(refresh_token);

    const redis = jest.spyOn(redisService, "set");
    const token = await authServiceImpl.login({ email, password });

    expect(redis).toHaveBeenCalledWith(
      `userRefreshToken: ${id}`,
      refresh_token,
      "EX",
      604800
    );
    expect(token).toEqual({ access_token, refresh_token });
    expect(mockBcryptService.compare).toHaveBeenCalledWith(
      password,
      hashedPassword
    );
    expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
      sub: id,
      email: email,
    });
    expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith({
      sub: id,
      email: email,
    });
  });

  it("Should return 404 Email not registered when login", async () => {
    mockUserService.findUserWithPassword.mockResolvedValue(null);
    mockBcryptService.compare.mockResolvedValue(true);
    mockTokenService.generateAccessToken.mockReturnValue(access_token);
    mockTokenService.generateRefreshToken.mockReturnValue(refresh_token);

    const spyRedis = jest.spyOn(redisService, "set");

    expect(spyRedis).not.toHaveBeenCalledWith(
      `userAccessToken: ${id}`,
      access_token,
      "EX",
      3600
    );
    await expect(authServiceImpl.login({ email, password })).rejects.toThrow(
      new HttpException(HttpStatus.NOT_FOUND, `Email not registered`)
    );
    expect(mockBcryptService.compare).not.toHaveBeenCalled;
    expect(mockTokenService.generateAccessToken).not.toHaveBeenCalledWith({
      sub: id,
      email: email,
    });
    expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalledWith({
      sub: id,
      email: email,
    });
  });

  it("Should return 401 Wrong password when login", async () => {
    mockUserService.findUserWithPassword.mockResolvedValue(updateUser);
    mockBcryptService.compare.mockResolvedValue(false);
    mockTokenService.generateAccessToken.mockReturnValue(access_token);
    mockTokenService.generateRefreshToken.mockReturnValue(refresh_token);

    const spyRedis = jest.spyOn(redisService, "set");

    expect(spyRedis).not.toHaveBeenCalledWith(
      `userAccessToken: ${id}`,
      access_token,
      3600
    );
    await expect(authServiceImpl.login({ email, password })).rejects.toThrow(
      new HttpException(HttpStatus.UNAUTHORIZED, `Wrong password`)
    );
    expect(mockBcryptService.compare).not.toHaveBeenCalled;
    expect(mockTokenService.generateAccessToken).not.toHaveBeenCalledWith({
      sub: id,
      email: email,
    });
    expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalledWith({
      sub: id,
      email: email,
    });
  });

  it("Should return erase token when logout", async () => {
    const spyRedis = jest.spyOn(redisService, "del");
    const spy = jest.spyOn(authServiceImpl, "logOut");

    const token = await authServiceImpl.logOut(id);

    expect(spy).toHaveBeenCalled();
    expect(spyRedis).toHaveBeenCalledWith(`userAccessToken: ${id}`);
    expect(token).toBeTruthy();
  });
});
