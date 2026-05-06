import { Elysia, t } from "elysia";
import { billingPlugin } from "./billing.plugin";

export const createBillingBody = t.Object({
	userId: t.String(),
	value: t.Number()
});

export type CreateBillingBody = typeof createBillingBody.static;

export const billingRouter = new Elysia()
    .use(billingPlugin)
    .group('', (app) => 
        app
            .get("/billings", async ({ 
                getBillingsUseCase
            }) => await getBillingsUseCase.execute())
            
            .post('/billing', 
                async ({ body, createBillingUseCase }) => 
                    await createBillingUseCase.execute(body), 
                { 
                    body: createBillingBody 
                }
            )
    )