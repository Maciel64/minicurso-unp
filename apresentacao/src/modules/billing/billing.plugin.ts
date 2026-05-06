import Elysia from "elysia";
import { GetBillingsUseCase } from "./use-cases/get-billings.use-case";
import { CreateBillingUseCase } from "./use-cases/create-billing.use-case";
import { AsaasProvider } from "./providers/asaas.provider";
import { billingRepository } from "./billing.repository";
import { emailPlugin } from "../email/email.plugin";
import { userPlugin } from "../user/user.plugin";

const asaasProvider = new AsaasProvider()

export const billingPlugin = (app: Elysia) => app
    .use(emailPlugin)
    .use(userPlugin)
    .decorate('billingPort', asaasProvider)
    .decorate('billingRepository', billingRepository)
    .derive(({ billingRepository, billingPort, userRepository, emailPort }) => ({
        getBillingsUseCase: new GetBillingsUseCase(billingRepository),
        createBillingUseCase: new CreateBillingUseCase(userRepository, billingRepository, billingPort, emailPort)
    }))