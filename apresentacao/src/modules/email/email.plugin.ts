import Elysia from "elysia";
import { resendProvider } from "./providers/resend.provider";

export const emailPlugin = new Elysia()
	.decorate('emailPort', resendProvider)