import { AxiosError } from "axios";
import { DateTime } from "../../datetime/models/DateTime";
import { EmailPort } from "../../email/ports/email.port";
import { UserRepository } from "../../user/user.repository";
import { BillingRepository } from "../billing.repository";
import { CreateBillingBody } from "../billing.routes";
import { BillingPort } from "../ports/billing.port";

export class CreateBillingUseCase {
  constructor (
    private userRepository: UserRepository,
    private billingRepository: BillingRepository,
    private billingPort: BillingPort,
    private emailPort: EmailPort) {}

	async execute(data: CreateBillingBody) {
    const { userId, value } = data;

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    let billingClient = await this.billingPort.getCustomerByEmail(user.email);

    if (!billingClient) {
      billingClient = await this.billingPort.createCustomer({
        cpf: user.cpf,
        email: user.email,
        name: user.name,
      });
    }

    const dueDate = new DateTime().plusDays(1).getFullDate()

    const billingReturn = await this.billingPort.createBilling({
      customer: billingClient.id,
      value,
      dueDate,
    });

    const billing = await this.billingRepository.create({
      value,
      dueAt: new Date(dueDate),
      externalId: billingReturn.id,
      link: billingReturn.link,
      user: {
        connect: { id: userId }
      }
    });

    await this.emailPort.sendEmail({
      to: user.email,
      subject: 'Pagamento gerado!',
      payload: `
				<p>Olá ${user.name},</p>
				<p>Seu pagamento foi gerado com sucesso!</p>
				<a href="${billingReturn.link}">Link do pagamento</a>
			`
    });

    return billing;
	}
}