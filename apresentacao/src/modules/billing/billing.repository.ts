import { prisma } from "../../infra/prisma";
import { Prisma, BillingStatus } from "../../generated/prisma/client";

export class BillingRepository {
  async create(data: Prisma.BillingCreateInput) {
    return await prisma.billing.create({ data });
  }

  async findByExternalId(externalId: string) {
    return await prisma.billing.findFirst({
      where: { externalId },
      include: { user: true }
    });
  }

  async updateStatus(id: string, status: BillingStatus, paidAt?: Date, dueAt?: Date) {
    return await prisma.billing.update({
      where: { id },
      data: { status, paidAt, dueAt }
    });
  }

  async findAll() {
    return await prisma.billing.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export const billingRepository = new BillingRepository();
