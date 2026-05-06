import { Elysia, t } from "elysia";
import { userPlugin } from "./user.plugin";

const SigninUserBody = t.Object({
	name: t.String(),
	email: t.String(),
	password: t.String(),
	cpf: t.String(),
});

export const userRouter = new Elysia()
	.use(userPlugin)
	.get("/users", async ({ getUsersUseCase }) => await getUsersUseCase.execute())
	.post("/signin", async ({ body, signinUseCase }) => await signinUseCase.execute(body), { body: SigninUserBody });
