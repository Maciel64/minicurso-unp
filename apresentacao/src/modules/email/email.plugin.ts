import Elysia from "elysia";
import { resendProvider } from "./providers/resend.provider";
import { mailgunProvider } from "./providers/mailgun.provider";

export const emailPlugin = new Elysia()
	.decorate('emailPort', mailgunProvider)