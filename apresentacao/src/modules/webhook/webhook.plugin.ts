import { Elysia } from "elysia";
import { HandleBillingEventWebhookUseCase } from "./use-cases/handle-billing-event-webhook.use-case";
import { billingRepository } from "../billing/billing.repository";
import { emailPlugin } from "../email/email.plugin";
import { asaasEventsMapper } from "./providers/asaas";


export const webhookPlugin = (app: Elysia) => app
	.use(emailPlugin)
  .decorate('providerEventsMapper', asaasEventsMapper)
  .derive(({ emailPort, providerEventsMapper }) => ({
    handleBillingEventWebhookUseCase: new HandleBillingEventWebhookUseCase(billingRepository, emailPort, providerEventsMapper)
  }))