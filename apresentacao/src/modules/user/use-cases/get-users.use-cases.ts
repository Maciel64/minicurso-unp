import { UserRepository } from "../user.repository";

export class GetUsersUseCase {
  constructor(
    private userRepository: UserRepository
  ) {}

  async execute() {
    return await this.userRepository.findAll();
  }
}