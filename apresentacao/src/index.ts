import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { userRouter } from "./modules/user/user.routes";
import { billingRouter } from "./modules/billing/billing.routes";
import { webhookRouter } from "./modules/webhook/webhook.routes";

const app = new Elysia()
	.use(cors())
	.get("/", () => "Hello Elysia")
  .use(userRouter)
  .use(billingRouter)
  .use(webhookRouter)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
