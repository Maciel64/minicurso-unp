import { TemplateLoader, TemplateRenderer } from "../../../infra/template";
import { EmailPort } from "../../email/ports/email.port";
import { Hasher } from "../../hash/Hash";
import { UserRepository } from "../user.repository";

export class SigninUseCase {
  constructor(
    private userRepository: UserRepository,
    private templateLoader: TemplateLoader,
    private templateRenderer: TemplateRenderer,
    private emailPort: EmailPort
  ) {}

  async execute(data: any) {
    const { email, name, password, cpf } = data;

    const userExists = await this.userRepository.findByEmail(email);
    if (userExists) throw new Error(`User with email ${email} already exists`);

    const hashedPassword = new Hasher().hash(password);

    const user = await this.userRepository.create({
      email,
      name,
      cpf,
      password: hashedPassword,
    });

    const html = await this.templateRenderer.render(
      await this.templateLoader.loadFile("welcome.html"),
      {
        name,
        email,
        password
      }
    )

    await this.emailPort.sendEmail({
      to: email,
      subject: "Bem vindo a ao Minicurso de Código Limpo e Arquitetura!",
      payload: html
    });

    return { user };
  }
}