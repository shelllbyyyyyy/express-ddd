import { HttpException } from "@/shared/common/exceptions/http-exception";
import { HttpStatus } from "@/shared/common/enum/http-status";
import { LoginSchema } from "@/shared/dto/user/login.dto";
import { UserSchema } from "@/shared/dto/user/user.dto";
import { BcryptService } from "@/shared/libs/bcrypt";
import { TokenService } from "@/shared/libs/token";
import { redis } from "@/shared/libs/redis";

import { UserService } from "../domain/services/user.service";

export class AuthServiceImpl {
  constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService,
    private readonly tokenService: TokenService
  ) {}

  async login(data: LoginSchema) {
    const { email, password } = data;

    const user = await this.validateCredentialsUser({ email, password });

    const access_token = this.tokenService.generateAccessToken({
      sub: user.Id,
      email: user.Email,
    });

    const refresh_token = this.tokenService.generateRefreshToken({
      sub: user.Id,
      email: user.Email,
    });

    await redis.set(
      `userRefreshToken: ${user.Id}`,
      refresh_token,
      "EX",
      7 * 24 * 60 * 60
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async validateCredentialsUser(data: LoginSchema) {
    const { email, password } = data;

    const user = await this.userService.findUserWithPassword(email);

    if (!user)
      throw new HttpException(HttpStatus.NOT_FOUND, `Email not registered`);

    const compare = await this.bcryptService.compare(password, user.Password);

    if (!compare)
      throw new HttpException(HttpStatus.UNAUTHORIZED, `Wrong password`);

    return user;
  }

  async refresh(token: string) {
    const { sub, email } = this.tokenService.verifyRefreshToken(token);

    const access_token = this.tokenService.generateAccessToken({
      sub: sub,
      email: email,
    });

    return { access_token };
  }

  async register(data: UserSchema) {
    const { email, password, username } = data;

    const findUser = await this.userService.findUser(email);

    if (findUser) {
      throw new HttpException(
        HttpStatus.CONFLICT,
        `This email ${email} already exists`
      );
    }

    const hashedPassword = await this.bcryptService.hash(password);

    const result = await this.userService.createUser({
      email,
      password: hashedPassword,
      username,
    });

    if (!result) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid email format");
    }

    return result;
  }

  async logOut(id: string) {
    redis.del(`userAccessToken: ${id}`);

    return true;
  }
}
