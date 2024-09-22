import { HttpException } from "@/shared/common/exceptions/http-exception";
import { BcryptService } from "@/shared/libs/bcrypt";
import { HttpStatus } from "@/shared/common/enum/http-status";

import { User } from "../domain/entities/user.entity";
import { UserService } from "../domain/services/user.service";
import { UserFactory } from "../domain/factories/user.factory";

export class UserServiceImpl {
  constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService
  ) {}

  async findUser(email: string) {
    const findUser: User = await this.userService.findUser(email);
    if (!findUser)
      throw new HttpException(HttpStatus.NOT_FOUND, `User not found`);

    return UserFactory.toResponse(findUser);
  }

  async updateUser(email: string, oldPassword: string, newPassword: string) {
    const user = await this.userService.findUserWithPassword(email);

    if (!user) throw new HttpException(HttpStatus.NOT_FOUND, `User not found`);

    const [compareOldPassword, compareNewPassword] = await Promise.all([
      this.bcryptService.compare(oldPassword, user.Password),
      this.bcryptService.compare(newPassword, user.Password),
    ]);

    if (!compareOldPassword) {
      throw new HttpException(HttpStatus.UNAUTHORIZED, `Password not match`);
    } else if (compareNewPassword) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        `New Password have to be different with old password`
      );
    }

    const hashedPassword = await this.bcryptService.hash(newPassword);

    const update = user.updatePassword(hashedPassword);

    const result = await this.userService.updatePassword(update);

    return { id: result.Id };
  }

  async deleteUser(email: string) {
    const findUser: User = await this.userService.findUser(email);
    if (!findUser)
      throw new HttpException(HttpStatus.NOT_FOUND, `User not found`);

    await this.userService.deleteUser(email);

    return true;
  }
}
