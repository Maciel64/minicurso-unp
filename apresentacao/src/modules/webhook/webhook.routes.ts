import { Elysia, t } from "elysia";
import { webhookPlugin } from "./webhook.plugin";

export const AsaasEvents = t.Union([
  t.Literal("PAYMENT_AUTHORIZED"),
  t.Literal("PAYMENT_CONFIRMED"),
  t.Literal("PAYMENT_OVERDUE"),
  t.Literal("PAYMENT_RECEIVED"),
  t.Literal("PAYMENT_DELETED"),
]);

export const AsaasWebhookResponse = t.Object({
  id: t.String(),
  event: AsaasEvents,
  payment: t.Object({
    id: t.String(),
  }, { additionalProperties: true })
}, { additionalProperties: true });

export const webhookRouter = new Elysia()
  .use(webhookPlugin)
	.post('/webhooks', 
    ({ body, handleBillingEventWebhookUseCase, params }) => handleBillingEventWebhookUseCase.execute(body),
    { body: AsaasWebhookResponse });
