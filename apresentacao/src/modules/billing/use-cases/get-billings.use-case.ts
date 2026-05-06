import { BillingPort } from "../ports/billing.port";
import { BillingRepository } from "../billing.repository";

export class GetBillingsUseCase {
	constructor(private billingRepository: BillingRepository) {}

	async execute() {
		const billings = await this.billingRepository.findAll();
		
		return billings;
	}
}