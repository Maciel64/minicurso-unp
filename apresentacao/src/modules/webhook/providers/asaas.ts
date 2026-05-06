import { BillingStatus } from "../../../generated/prisma/enums";

export const asaasEventsMapper: Record<string, BillingStatus> = {
  PAYMENT_AUTHORIZED: 'PAID',
  PAYMENT_CONFIRMED: 'PAID',
  PAYMENT_RECEIVED: 'PAID',
  PAYMENT_OVERDUE: 'CANCELLED',
  PAYMENT_DELETED: 'CANCELLED',
};


