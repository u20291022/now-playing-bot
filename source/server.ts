import https from "https";
import Koa, { Context, Next } from "koa";
import KoaRouter from "@koa/router";
import { readFileSync } from "fs";
import { ParsedUrlQuery } from "querystring";
import { users } from "./utils/users";
import { TelegramBot } from "./bot";

export class AuthServer {
  private bot: TelegramBot;

  private SERVER_PORT = 443; // default HTTPS port
  private SERVER_API_PATH = "/"

  private SSL_CERTIFICATE_PATH = "ssl/client-cert.pem";
  private SSL_KEY_PATH = "ssl/client-key.pem";

  private SSL_CERTIFICATE_BUFFER = readFileSync(this.SSL_CERTIFICATE_PATH);
  private SSL_KEY_BUFFER = readFileSync(this.SSL_KEY_PATH);

  private SERVER_OPTIONS: https.ServerOptions = {
    cert: this.SSL_CERTIFICATE_BUFFER,
    key: this.SSL_KEY_BUFFER
  }

  private server: Koa;
  private router: KoaRouter;

  constructor(bot: TelegramBot) {
    this.server = new Koa();
    this.router = new KoaRouter({ prefix: this.SERVER_API_PATH });
    this.bot = bot;
  }

  public launch() {
    this.listenCallback();
    this.createServer();
    console.log(`HTTPS Server was succesfully created at port ${this.SERVER_PORT}!`);
  }

  private listenCallback() {
    this.router.get("callback", async (context) => {
      const query = context.query;
      const token = this.getTokenFromQuery(query);
      const userId = this.getUserIdFromQuery(query);
      users.addUser(userId, token);
      this.bot.sendSuccessMessage(userId);
      context.body = "Вы были авторизированы!\nМожете возвращаться к боту!";
    });
  }

  private getTokenFromQuery(query: ParsedUrlQuery): string {
    return query["code"] as string; // spotify sends one string as code
  }

  private getUserIdFromQuery(query: ParsedUrlQuery): string {
    return query["state"] as string; // spotify sends one string as code
  }

  private createServer() {
    this.server
      .use(this.log)
      .use(this.setHeaders)
      .use(this.router.routes())
      .use(this.router.allowedMethods());

    https.createServer(
      this.SERVER_OPTIONS,
      this.server.callback()
    ).listen(this.SERVER_PORT);
  }

  private async log(context: Context, next: Next) {
    const request = context.request;
    const requestIp = request.ip;
    const requestPath = request.path;
    const requestQueryString = request.querystring;

    const logMessage = `Ip "${requestIp}" just requested "${requestPath}" query: "${requestQueryString}"`;
    console.log(logMessage);

    await next();
  }

  private async setHeaders(context: Context, next: Next) {
    context.set("Access-Control-Allow-Origin", "*");
    context.set("Content-Type", "charset=utf-8");
    await next();
  }
}