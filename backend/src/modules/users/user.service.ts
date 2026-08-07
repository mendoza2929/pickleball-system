import { UserRepository } from "./user.repository";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { UpdateProfileInput } from "./user.validator";
export class UserService {

  private userRepository = new UserRepository();

  async getProfile(userId: number) {

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    return user;
  }

  async updateProfile(
    userId: number,
    data: UpdateProfileInput
) {
    return await this.userRepository.updateProfile(
        userId,
        data
    );
}

}