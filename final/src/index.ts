import { Elysia, Static, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { Resend } from "resend";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes, scryptSync } from 'node:crypto'
import Handlebars from 'handlebars'
import axios, { AxiosError } from "axios";
import { addDays } from 'date-fns'

const app = new Elysia()
	.use(cors())
	.get("/", () => "Hello Elysia");

/**
 * Um fluxo comum de cadastro para um usuário:
 * 1. Receber os dados do usuário
 * 2. Validar os dados
 * 3. Salvar os dados no banco de dados
 * 4. Retornar os dados do usuário
 * 5. Retornar uma mensagem de sucesso
 * 6. Enviar email de boas vindas
 */


const SigninUserBody = t.Object({
	name: t.String(),
	email: t.String(),
	password: t.String(),
	cpf: t.String(),
});

const resend = new Resend(process.env.RESEND_API_KEY as string);

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
	log: ['error']
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

const userRouter = new Elysia()
	.get("/users", async () => {
		return await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				cpf: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
	})
	.post(
	"/signin",
	async ({ body }) => {
		const { email, name, password, cpf } = body

		const userExists = await prisma.user.findUnique({ where: { email } });

		if (userExists) throw new Error(`User with email ${email} already exists`);

		const salt = randomBytes(16).toString("hex");
  	const hash = scryptSync(password, salt, 64).toString("hex");

		const newPassword = `${salt}:${hash}`;

		const user = await prisma.user.create({
			data: {
				email,
				name,
				cpf,
				password: newPassword,
			}
		});

		const raw = `
			<!DOCTYPE html>
			<html lang="pt-BR">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Bem-vindo!</title>
			</head>
			<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
				<table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f4f4f5; padding: 40px 20px;">
					<tr>
						<td align="center">
							<table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
								
								<!-- Header -->
								<tr>
									<td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px 32px; text-align: center;">
										<div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.15); border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px;">
											&#9993;
										</div>
										<h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600;">Bem-vindo!</h1>
									</td>
								</tr>

								<!-- Conteudo -->
								<tr>
									<td style="padding: 36px 32px;">
										<p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
											Olá, <strong style="color: #1e3a5f;">{{name}}</strong>!
										</p>
										<p style="margin: 0 0 28px; color: #6b7280; font-size: 15px; line-height: 1.6;">
											Sua conta foi criada com sucesso. Abaixo estão suas credenciais de acesso:
										</p>

										<!-- Credenciais -->
										<table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 28px;">
											<tr>
												<td style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
													<p style="margin: 0 0 4px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">E-mail</p>
													<p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500;">{{email}}</p>
												</td>
											</tr>
											<tr>
												<td style="padding: 20px 24px;">
													<p style="margin: 0 0 4px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Senha</p>
													<p style="margin: 0; color: #1f2937; font-size: 15px; font-family: 'Courier New', monospace; font-weight: 500; background-color: #fff; padding: 8px 12px; border-radius: 4px; border: 1px dashed #d1d5db; display: inline-block;">{{password}}</p>
												</td>
											</tr>
										</table>

										<table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 6px 6px 0; margin-bottom: 28px;">
											<tr>
												<td style="padding: 14px 16px;">
													<p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
														<strong>Importante:</strong> Recomendamos que você altere sua senha no primeiro acesso.
													</p>
												</td>
											</tr>
										</table>
								</tr>

								<tr>
									<td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
										<p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
											Este e-mail foi enviado automaticamente. Por favor, não responda.
										</p>
										<p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
											&copy; 2026 Sua Empresa. Todos os direitos reservados.
										</p>
									</td>
								</tr>

							</table>
						</td>
					</tr>
				</table>
			</body>
			</html>
		`

		const template = Handlebars.compile(raw);

		const html = template({ name, email, password });

		resend.emails.send({
			from: "onboarding@resend.dev",
			to: email,
			subject: "Bem vindo a ao Minicurso de Código Limpo e Arquitetura!",
			html,
		});

		return { user };
	},
	{ body: SigninUserBody },
);

app.use(userRouter);

/**
 * Receber e lidar com Webhooks de uma aplicação de pagamentos:
 * 1. Receber eventos de um webhook
 * 2. Validar dados do webhook
 * 3. Direcionar lógica a partir de determinados eventos
 */

const CreateBillingBody = t.Object({
	userId: t.String(),
	value: t.Number()
});

const asaasApi = axios.create({
	baseURL: 'https://api-sandbox.asaas.com/v3',
	headers: {
		'Content-Type': 'application/json',
		'access_token': process.env.ASAAS_API_KEY as string,
		"User-Agent": "Minicurso Unp"
	},
})

export interface AsaasGetClientResponse {
  object: string
  hasMore: boolean
  totalCount: number
  limit: number
  offset: number
  data: AsaasData[]
}

export interface AsaasData {
  object: string
  id: string
  dateCreated: string
  name: string
  email: string
  phone: string
  mobilePhone: string
  address: string
  addressNumber: string
  complement: string
  province: string
  city: number
  cityName: string
  state: string
  country: string
  postalCode: string
  cpfCnpj: string
  personType: string
  deleted: boolean
  additionalEmails: string
  externalReference: string
  notificationDisabled: boolean
  observations: string
  foreignCustomer: boolean
}

export interface AsaasCreateClientResponse {
  object: string
  id: string
  dateCreated: string
  name: string
  email: string
  phone: string
  mobilePhone: string
  address: string
  addressNumber: string
  complement: string
  province: string
  city: number
  cityName: string
  state: string
  country: string
  postalCode: string
  cpfCnpj: string
  personType: string
  deleted: boolean
  additionalEmails: string
  externalReference: string
  notificationDisabled: boolean
  observations: string
  foreignCustomer: boolean
}


export interface AsaasCreateClientBody {
	name: string
	email: string
	cpfCnpj: string
}

export interface AsaasCreateBillingBody {
	customer: string
	billingType: 'UNDEFINED' | 'PIX' | 'CREDIT_CARD' | 'BOLETO'
	value: number
	dueDate: string
}

export type AsaasCreateBillingResponse = {
  object: string
  id: string
  dateCreated: string
  customer: string
  subscription: any
  installment: any
  checkoutSession: string
  paymentLink: any
  value: number
  netValue: number
  originalValue: any
  interestValue: any
  description: string
  billingType: string
  creditCard: {
    creditCardNumber: string
    creditCardBrand: string
    creditCardToken: any
  }
  canBePaidAfterDueDate: boolean
  pixTransaction: any
  pixQrCodeId: any
  status: string
  dueDate: string
  originalDueDate: string
  paymentDate: any
  clientPaymentDate: any
  installmentNumber: any
  invoiceUrl: string
  invoiceNumber: string
  externalReference: string
  deleted: boolean
  anticipated: boolean
  anticipable: boolean
  creditDate: string
  estimatedCreditDate: string
  transactionReceiptUrl: any
  nossoNumero: string
  bankSlipUrl: string
  discount: {
    value: number
    dueDateLimitDays: number
    type: string
  }
  fine: {
    value: number
  }
  interest: {
    value: number
  }
  split: Array<{
    id: string
    walletId: string
    fixedValue: number
    percentualValue: any
    totalValue: number
    cancellationReason: string
    status: string
    externalReference: any
    description: any
  }>
  postalService: boolean
  daysAfterDueDateToRegistrationCancellation: any
  chargeback: {
    id: string
    payment: string
    installment: string
    customerAccount: string
    status: string
    reason: string
    disputeStartDate: string
    value: number
    paymentDate: string
    creditCard: {
      number: string
      brand: string
    }
    disputeStatus: string
    deadlineToSendDisputeDocuments: string
  }
  escrow: {
    id: string
    status: string
    expirationDate: string
    finishDate: string
    finishReason: string
  }
  refunds: Array<{
    dateCreated: string
    status: string
    value: number
    endToEndIdentifier: any
    description: any
    effectiveDate: string
    transactionReceiptUrl: any
    refundedSplits: Array<{
      id: string
      value: number
      done: boolean
    }>
  }>
}

type TBillingStatus = 'PAID' | 'CANCELLED' | 'PENDING'

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
  },

  {
    additionalProperties: true
  }

)
},
{
  additionalProperties: true
});


const billingRouter = new Elysia()
	.get("/billings", async () => {
		return await prisma.billing.findMany({
			include: {
				user: {
					select: {
						name: true,
						email: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
	})
	.post('/billing', async (req) => {
	const { userId, value } = req.body;

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		throw new Error('User not found');
	}

	try {
		const getAsaasClient = await asaasApi.get<AsaasGetClientResponse>('/customers', {
			params: {
				email: user.email,
			}
		});

	let asaasClient = getAsaasClient?.data?.data?.[0]

	if (!asaasClient) {
		const createAsaasClient = await asaasApi.post<AsaasCreateClientResponse>('/customers',{
			cpfCnpj: user.cpf,
			email: user.email,
			name: user.name,
		} as AsaasCreateClientBody)

		asaasClient = createAsaasClient.data
	}

	const dueDate = addDays(new Date(), 5).toISOString().split("T")[0]

	const asaasBilling = await asaasApi.post<AsaasCreateBillingResponse>('/payments',{
		customer: asaasClient.id,
		billingType: 'UNDEFINED',
		value,
		dueDate,
	} as AsaasCreateBillingBody)

	const billing = await prisma.billing.create({
		data: {
			value,
			dueAt: new Date(dueDate),
			externalId: asaasBilling.data.id,
			link: asaasBilling.data.invoiceUrl,
			user: {
				connect: {
					id: userId,
				}
			}
		},
	})

  await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: user.email,
			subject: 'Pagamento gerado!',
			html: `
				<p>Olá ${user.name},</p>
				<p>Seu pagamento foi gerado com sucesso!</p>
				<a href="${asaasBilling.data.invoiceUrl}">Link do pagamento</a>
			`,
		})

	return billing

	} catch (error) {
		if (error instanceof AxiosError) {
			console.log("Axios Error", error.response?.data)
		} else {
			console.log("getAsaasClient", JSON.stringify(error))
		}

		throw new Error(JSON.stringify(error as Error))
	}
}, {
	body: CreateBillingBody
})


const webhookRouter = new Elysia().post('/webhooks/asaas', async (req) => {
	const asaasEventsMapper: Record<Static<typeof AsaasEvents>, TBillingStatus> = {
		PAYMENT_AUTHORIZED: 'PAID',
		PAYMENT_CONFIRMED: 'PAID',
		PAYMENT_RECEIVED: 'PAID',
		PAYMENT_OVERDUE: 'CANCELLED',
		PAYMENT_DELETED: 'CANCELLED',
	}

  console.log("req.body", req.body)

	const billing = await prisma.billing.findFirst({
		where: {
			externalId: req.body.payment.id,
		},
		include: {
			user: true
		}
	})

	if (!billing) {
		throw new Error('Billing not found');
	}

	const status = asaasEventsMapper[req.body.event]

	if (status === 'PAID') {
		await prisma.billing.update({
			where: {
				id: billing.id,
			},
			data: {
				status,
        paidAt: new Date(),
			}
		})

		await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: billing.user.email,
			subject: 'Sua conta foi paga!',
			html: `
				<p>Hi ${billing.user.name},</p>
				<p>Seu pagamento foi confirmado!</p>
			`,
		})
	}

  if (status === 'CANCELLED') {
      await prisma.billing.update({
			where: {
				id: billing.id,
			},
			data: {
				status,
        dueAt: new Date(),
			}
		})

    await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: billing.user.email,
			subject: 'Sua conta venceu...',
			html: `
				<p>Olá ${billing.user.name},</p>
				<p>Sua conta venceu...</p>
			`,
		})
  }

  return 200
}, {
	body: AsaasWebhookResponse
});

app.use(billingRouter)
app.use(webhookRouter )

app.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);