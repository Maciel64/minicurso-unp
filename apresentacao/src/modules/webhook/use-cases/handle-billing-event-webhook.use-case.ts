import { BillingStatus } from "../../../generated/prisma/enums";
import { BillingRepository } from "../../billing/billing.repository";
import { EmailPort } from "../../email/ports/email.port";

export class HandleBillingEventWebhookUseCase {
	constructor(
    private billingRepository: BillingRepository,
    private emailPort: EmailPort,
    private providerEventsMapper: Record<string, BillingStatus>
  ) {}

	async execute(body: any) {
    const billing = await this.billingRepository.findByExternalId(body.payment.id);
    
    if (!billing) throw new Error('Billing not found');

    const status = this.providerEventsMapper[body.event];

    if (status === 'PAID') {
      await this.billingRepository.updateStatus(billing.id, status, new Date());
      
      await this.emailPort.sendEmail({
        to: billing.user.email,
        subject: 'Sua conta foi paga!',
        payload: `
					<p>Hi ${billing.user.name},</p>
					<p>Seu pagamento foi confirmado!</p>
				`
      });
    }

    if (status === 'CANCELLED') {
      await this.billingRepository.updateStatus(billing.id, status, undefined, new Date());

      await this.emailPort.sendEmail({
        to: billing.user.email,
        subject: 'Sua conta venceu...',
        payload: `
					<p>Olá ${billing.user.name},</p>
					<p>Sua conta venceu...</p>
				`
      });
    }

    return 200;
	}
}