import { Resend } from "resend";
import { EmailPort, SendEmailPayload } from "../ports/email.port";

export class ResendProvider implements EmailPort  {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY as string);
  }

  async sendEmail(data: SendEmailPayload) {
    await this.resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.to,
      subject: data.subject,
      html: data.payload,
    });
  }
}

export const resendProvider = new ResendProvider();
