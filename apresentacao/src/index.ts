import { Elysia, t } from "elysia";
import { Resend } from "resend";

const SigninUserBody = t.Object({
	name: t.String(),
	email: t.String(),
	password: t.String(),
});

const app = new Elysia().get("/", () => "Hello Elysia");

/**
 * Um fluxo comum de cadastro para um usuário:
 * 1. Receber os dados do usuário
 * 2. Validar os dados
 * 3. Salvar os dados no banco de dados
 * 4. Retornar os dados do usuário
 * 5. Retornar uma mensagem de sucesso
 * 6. Enviar email de boas vindas
 */

const resend = new Resend("re_e1ApAih6_KvVQSBztT1Cxm3aS7KnFrN7y");

const userRouter = new Elysia().post(
	"/signin",
	({ body }) => {
		resend.emails.send({
			from: "onboarding@resend.dev",
			to: "macielsuassuna14@gmail.com",
			subject: "Hello World",
			html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
		});

		console.log(body);

		return { success: true };
	},
	{ body: SigninUserBody },
);

app.use(userRouter);
app.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
