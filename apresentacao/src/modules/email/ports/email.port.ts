export interface SendEmailPayload {
	to: string
	subject: string
	payload: string
}

export interface EmailPort {
	sendEmail(data: SendEmailPayload): Promise<void>;
}