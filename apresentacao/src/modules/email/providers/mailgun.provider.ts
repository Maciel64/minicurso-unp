import { EmailPort, SendEmailPayload } from "../ports/email.port";

export class MailgunProvider implements EmailPort {
	async sendEmail(data: SendEmailPayload): Promise<void> {
		
	}
}

export const mailgunProvider = new MailgunProvider();