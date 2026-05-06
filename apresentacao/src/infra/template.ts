import Elysia from 'elysia';
import Handlebars from 'handlebars';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export class TemplateRenderer {
  async render(content: string, data: Record<string, string>) {
    return Handlebars.compile(content)(data);
  }
}

export class TemplateLoader {
  async loadFile(templateName: string) {
    return await readFile(join(process.cwd(), `./src/templates/${templateName}`), 'utf-8');
  }
}

export const templatePlugin = (app: Elysia) => app
  .decorate("templateLoader", new TemplateLoader())
  .decorate("templateRenderer", new TemplateRenderer())