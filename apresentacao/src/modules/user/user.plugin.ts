import Elysia from "elysia";
import { userRepository } from "./user.repository";
import { SigninUseCase } from "./use-cases/signin.use-case";
import { GetUsersUseCase } from "./use-cases/get-users.use-cases";
import { emailPlugin } from "../email/email.plugin";
import { templatePlugin } from "../../infra/template";

export const userPlugin = (app: Elysia) => app
	.use(emailPlugin)
  .use(templatePlugin)
	.decorate('userRepository', userRepository)
	.derive(({ userRepository, templateLoader, templateRenderer, emailPort }) => ({
		signinUseCase: new SigninUseCase(userRepository, templateLoader, templateRenderer, emailPort),
		getUsersUseCase: new GetUsersUseCase(userRepository)
	}))