import { prisma } from "../../infra/prisma";
import { Prisma } from "../../generated/prisma/client";

export class UserRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({ data });
  }

  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export const userRepository = new UserRepository();
